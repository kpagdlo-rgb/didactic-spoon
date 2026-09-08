import unittest
from decimal import Decimal

from scripts.meder_core import (
    Diagnostic, LimitOrder, LotSize, NotionalFilter, PriceFilter, Side,
    State, SymbolMetadata, Tolerance, diagnose_limit_gtc, parse_decimal,
    unresolved_ambiguous_submission,
)


D = Decimal


def metadata(*, min_qty="0.001", min_notional=None, max_notional=None, step="0.001"):
    return SymbolMetadata(
        symbol="ABCUSDT", lot_size=LotSize(D(min_qty), D("100"), D(step)),
        market_lot_size=LotSize(D("10"), D("20"), D("1")),
        price_filter=PriceFilter(D("0.01"), D("1000"), D("0.01")),
        min_notional=NotionalFilter(D(min_notional)) if min_notional else None,
        notional=NotionalFilter(None, D(max_notional)) if max_notional else None,
    )


def buy(quantity, *, cap="100", tolerance=Tolerance.ALLOW_ALL_DOWNWARD):
    return LimitOrder("ABCUSDT", Side.BUY, D("100"), D(quantity), D(cap), tolerance)


class MederCoreTests(unittest.TestCase):
    def test_required_repair_fixture(self):
        result = diagnose_limit_gtc(buy("0.00123", cap="0.123"), metadata(min_notional="0.10"))
        self.assertEqual(result.state, State.REPAIR_PROPOSED)
        self.assertEqual(result.proposed_quantity, D("0.001"))
        self.assertEqual(result.proposed_notional, D("0.100"))

    def test_budget_refusal_fixture(self):
        result = diagnose_limit_gtc(buy("0.100", cap="9.99"), metadata(min_notional="10"))
        self.assertEqual(result.state, State.REFUSED)

    def test_zero_origin_grid_regression(self):
        result = diagnose_limit_gtc(buy("0.0022"), metadata(min_qty="0.0015"))
        self.assertEqual(result.state, State.REPAIR_PROPOSED)
        self.assertEqual(result.proposed_quantity, D("0.002"))

    def test_market_lot_size_does_not_apply_to_limit_order(self):
        result = diagnose_limit_gtc(buy("0.010"), metadata())
        self.assertEqual(result.state, State.ALREADY_VALID)

    def test_intersects_min_notional_and_notional(self):
        data = metadata(min_notional="0.10")
        data = SymbolMetadata(**{**data.__dict__, "notional": NotionalFilter(D("0.20"), D("1"))})
        result = diagnose_limit_gtc(buy("0.0023", cap="1"), data)
        self.assertEqual(result.proposed_quantity, D("0.002"))
        self.assertEqual(result.state, State.REPAIR_PROPOSED)

    def test_exact_policy_never_repairs(self):
        result = diagnose_limit_gtc(buy("0.00123", cap="1", tolerance=Tolerance.EXACT), metadata())
        self.assertEqual(result.state, State.REFUSED_EXACT_TOLERANCE)

    def test_sell_is_exact_only(self):
        order = LimitOrder("ABCUSDT", Side.SELL, D("100"), D("0.00123"))
        self.assertEqual(diagnose_limit_gtc(order, metadata()).state, State.REFUSED_EXACT_TOLERANCE)

    def test_sell_rejects_buy_policy(self):
        order = LimitOrder("ABCUSDT", Side.SELL, D("100"), D("0.001"), tolerance=Tolerance.ALLOW_ALL_DOWNWARD)
        self.assertEqual(diagnose_limit_gtc(order, metadata()).state, State.INCOMPLETE)

    def test_disabled_price_rules_are_ignored(self):
        data = metadata()
        data = SymbolMetadata(**{**data.__dict__, "price_filter": PriceFilter()})
        order = LimitOrder("ABCUSDT", Side.BUY, D("100.003"), D("0.001"), D("1"), Tolerance.EXACT)
        self.assertEqual(diagnose_limit_gtc(order, data).state, State.ALREADY_VALID)

    def test_invalid_price_is_never_repaired(self):
        order = buy("0.00123", cap="1")
        order = LimitOrder(**{**order.__dict__, "price": D("100.003")})
        self.assertEqual(diagnose_limit_gtc(order, metadata()).state, State.REFUSED)

    def test_zero_lot_step_is_incomplete(self):
        self.assertEqual(diagnose_limit_gtc(buy("0.001"), metadata(step="0")).state, State.INCOMPLETE)

    def test_missing_metadata_is_incomplete(self):
        self.assertEqual(diagnose_limit_gtc(buy("0.001"), None).state, State.INCOMPLETE)

    def test_ambiguous_is_unresolved_without_patch(self):
        result = unresolved_ambiguous_submission()
        self.assertEqual(result.state, State.UNRESOLVED)
        self.assertIsNone(result.proposed_quantity)

    def test_decimal_parser_rejects_floats_exponents_and_excess_precision(self):
        for value in ("1e-3", "-1", ".1", "1." , "1" * 41):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    parse_decimal(value)
        self.assertEqual(parse_decimal("0.001", positive=True), D("0.001"))

    def test_no_upward_repair_for_low_notional(self):
        result = diagnose_limit_gtc(buy("0.001", cap="1"), metadata(min_notional="0.20"))
        self.assertEqual(result.state, State.REFUSED)
        self.assertIsNone(result.proposed_quantity)


if __name__ == "__main__":
    unittest.main()
