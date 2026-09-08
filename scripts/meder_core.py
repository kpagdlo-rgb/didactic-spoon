"""Read-only, exact local diagnostics for Binance-style LIMIT/GTC orders.

This module intentionally has no HTTP, credential, signing, or order-submission
code.  It only evaluates supplied metadata and may propose a quantity change.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation
from enum import Enum
import re
from typing import Optional, Tuple


class State(str, Enum):
    ALREADY_VALID = "ALREADY_VALID"
    REPAIR_PROPOSED = "REPAIR_PROPOSED"
    REFUSED_EXACT_TOLERANCE = "REFUSED_EXACT_TOLERANCE"
    REFUSED = "REFUSED"
    INCOMPLETE = "INCOMPLETE"
    UNRESOLVED = "UNRESOLVED"


class Tolerance(str, Enum):
    EXACT = "exact"
    ALLOW_ALL_DOWNWARD = "allow_all_downward"


class Side(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


_DECIMAL = re.compile(r"^(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$")


def parse_decimal(value: str, *, positive: bool = False, allow_zero: bool = True) -> Decimal:
    """Parse the closed, unsigned decimal format used by the diagnostic API."""
    if not isinstance(value, str) or not _DECIMAL.fullmatch(value):
        raise ValueError("decimal must be an unsigned base-10 string without exponent")
    digits = value.replace(".", "")
    fraction = value.partition(".")[2]
    if len(digits) > 40 or len(fraction) > 18:
        raise ValueError("decimal precision exceeds diagnostic limits")
    try:
        result = Decimal(value)
    except InvalidOperation as exc:  # Defensive; regex has already constrained input.
        raise ValueError("invalid decimal") from exc
    if positive and result <= 0:
        raise ValueError("decimal must be positive")
    if not allow_zero and result == 0:
        raise ValueError("decimal must be non-zero")
    return result


@dataclass(frozen=True)
class PriceFilter:
    min_price: Decimal = Decimal("0")
    max_price: Decimal = Decimal("0")
    tick_size: Decimal = Decimal("0")


@dataclass(frozen=True)
class LotSize:
    """Binance LOT_SIZE values. The quantity grid is always zero-origin."""
    min_qty: Decimal
    max_qty: Decimal
    step_size: Decimal


@dataclass(frozen=True)
class NotionalFilter:
    min_notional: Optional[Decimal] = None
    max_notional: Optional[Decimal] = None


@dataclass(frozen=True)
class SymbolMetadata:
    lot_size: Optional[LotSize]
    # MARKET_LOT_SIZE is retained for faithful metadata representation. LIMIT/GTC
    # diagnostics intentionally use LOT_SIZE, never the market-only filter.
    market_lot_size: Optional[LotSize] = None
    price_filter: Optional[PriceFilter] = None
    min_notional: Optional[NotionalFilter] = None
    notional: Optional[NotionalFilter] = None
    symbol: Optional[str] = None
    trading: bool = True
    supports_limit: bool = True
    supports_gtc: bool = True


@dataclass(frozen=True)
class LimitOrder:
    symbol: str
    side: Side
    price: Decimal
    quantity: Decimal
    max_quote_notional: Optional[Decimal] = None
    tolerance: Tolerance = Tolerance.EXACT
    order_type: str = "LIMIT"
    time_in_force: str = "GTC"


@dataclass(frozen=True)
class Diagnostic:
    state: State
    reasons: Tuple[str, ...] = ()
    proposed_quantity: Optional[Decimal] = None
    proposed_notional: Optional[Decimal] = None
    unchecked: Tuple[str, ...] = field(default_factory=lambda: (
        "balances", "fees", "account filters", "dynamic price bounds"
    ))

    @property
    def partial_validation_notice(self) -> Optional[str]:
        if self.state in (State.INCOMPLETE, State.UNRESOLVED) or not self.unchecked:
            return None
        return "Partial validation — exchange acceptance unknown."


def unresolved_ambiguous_submission() -> Diagnostic:
    """Ambiguous execution has no authoritative lookup in this local core."""
    return Diagnostic(State.UNRESOLVED, ("execution outcome cannot be verified; do not resubmit",), unchecked=())


def _floor_step(value: Decimal, step: Decimal) -> Decimal:
    return (value // step) * step


def _ceil_step(value: Decimal, step: Decimal) -> Decimal:
    floor = _floor_step(value, step)
    return floor if floor == value else floor + step


def _on_grid(value: Decimal, step: Decimal) -> bool:
    return value % step == 0


def _notional_limits(metadata: SymbolMetadata) -> tuple[list[Decimal], list[Decimal]]:
    minimums, maximums = [], []
    # For LIMIT/GTC, intersect both filters regardless of their market flags.
    for rule in (metadata.min_notional, metadata.notional):
        if rule is not None:
            if rule.min_notional is not None:
                minimums.append(rule.min_notional)
            if rule.max_notional is not None:
                maximums.append(rule.max_notional)
    return minimums, maximums


def _check_metadata(order: LimitOrder, metadata: Optional[SymbolMetadata]) -> Tuple[str, ...]:
    if metadata is None:
        return ("missing symbol metadata",)
    failures = []
    if metadata.symbol is not None and metadata.symbol != order.symbol:
        failures.append("metadata symbol does not match order")
    if not metadata.trading:
        failures.append("symbol is not trading")
    if not metadata.supports_limit or not metadata.supports_gtc:
        failures.append("LIMIT/GTC is not supported by metadata")
    if metadata.lot_size is None:
        failures.append("missing LOT_SIZE filter")
    elif metadata.lot_size.step_size <= 0:
        failures.append("LOT_SIZE stepSize is zero or invalid")
    return tuple(failures)


def _validate(order: LimitOrder, metadata: SymbolMetadata, quantity: Decimal) -> Tuple[str, ...]:
    failures = []
    lot = metadata.lot_size
    assert lot is not None
    if quantity <= 0:
        failures.append("quantity must be positive")
    if quantity < lot.min_qty:
        failures.append("quantity is below LOT_SIZE minQty")
    if lot.max_qty != 0 and quantity > lot.max_qty:
        failures.append("quantity is above LOT_SIZE maxQty")
    if not _on_grid(quantity, lot.step_size):
        failures.append("quantity is off the zero-origin LOT_SIZE grid")
    price_filter = metadata.price_filter
    if order.price <= 0:
        failures.append("price must be positive")
    elif price_filter is not None:
        if price_filter.min_price != 0 and order.price < price_filter.min_price:
            failures.append("price is below PRICE_FILTER minPrice")
        if price_filter.max_price != 0 and order.price > price_filter.max_price:
            failures.append("price is above PRICE_FILTER maxPrice")
        if price_filter.tick_size != 0 and not _on_grid(order.price, price_filter.tick_size):
            failures.append("price is off the zero-origin PRICE_FILTER tick grid")
    notional = order.price * quantity
    mins, maxes = _notional_limits(metadata)
    if mins and notional < max(mins):
        failures.append("notional is below required minimum")
    if maxes and notional > min(maxes):
        failures.append("notional exceeds permitted maximum")
    if order.side == Side.BUY and order.max_quote_notional is not None and notional > order.max_quote_notional:
        failures.append("notional exceeds quote-notional cap")
    return tuple(failures)


def diagnose_limit_gtc(order: LimitOrder, metadata: Optional[SymbolMetadata]) -> Diagnostic:
    """Diagnose a LIMIT/GTC order and propose only a bounded BUY reduction."""
    if order.order_type != "LIMIT" or order.time_in_force != "GTC":
        return Diagnostic(State.INCOMPLETE, ("only LIMIT/GTC is supported",), unchecked=())
    if order.side not in (Side.BUY, Side.SELL):
        return Diagnostic(State.INCOMPLETE, ("unsupported order side",), unchecked=())
    if order.side == Side.BUY and order.max_quote_notional is None:
        return Diagnostic(State.INCOMPLETE, ("BUY requires a quote-notional cap",), unchecked=())
    if order.side == Side.SELL and (order.max_quote_notional is not None or order.tolerance != Tolerance.EXACT):
        return Diagnostic(State.INCOMPLETE, ("SELL accepts exact quantity without a BUY cap",), unchecked=())
    metadata_failures = _check_metadata(order, metadata)
    if metadata_failures:
        return Diagnostic(State.INCOMPLETE, metadata_failures, unchecked=())
    assert metadata is not None and metadata.lot_size is not None
    failures = _validate(order, metadata, order.quantity)
    if not failures:
        return Diagnostic(State.ALREADY_VALID)
    if order.tolerance == Tolerance.EXACT:
        return Diagnostic(State.REFUSED_EXACT_TOLERANCE, failures)
    # A protected invalid price cannot be fixed by changing quantity.
    if order.price <= 0 or any(reason.startswith("price ") for reason in failures):
        return Diagnostic(State.REFUSED, failures)
    lot = metadata.lot_size
    mins, maxes = _notional_limits(metadata)
    lower_terms = [lot.min_qty] + [minimum / order.price for minimum in mins]
    upper_terms = [order.quantity]
    if lot.max_qty != 0:
        upper_terms.append(lot.max_qty)
    if order.max_quote_notional is not None:
        upper_terms.append(order.max_quote_notional / order.price)
    upper_terms.extend(maximum / order.price for maximum in maxes)
    lower = _ceil_step(max(lower_terms), lot.step_size)
    upper = _floor_step(min(upper_terms), lot.step_size)
    if upper < lower:
        return Diagnostic(State.REFUSED, failures + ("no legal downward quantity satisfies intersected bounds",))
    proposed_failures = _validate(order, metadata, upper)
    if proposed_failures:  # Guard against future constraints not represented in bounds.
        return Diagnostic(State.REFUSED, failures + ("no safe quantity-only repair",))
    if upper == order.quantity:
        return Diagnostic(State.REFUSED, failures + ("original quantity cannot be changed downward to repair this order",))
    return Diagnostic(State.REPAIR_PROPOSED, failures, upper, order.price * upper)
