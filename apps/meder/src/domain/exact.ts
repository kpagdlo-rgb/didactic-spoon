/** Exact fractions; division never rounds before a grid boundary decision. */
export class Rational {
  readonly numerator: bigint;
  readonly denominator: bigint;

  constructor(numerator: bigint, denominator = 1n) {
    if (denominator === 0n) throw new RangeError("Zero denominator");
    if (denominator < 0n) { numerator = -numerator; denominator = -denominator; }
    let a = numerator < 0n ? -numerator : numerator;
    let b = denominator;
    while (b !== 0n) [a, b] = [b, a % b];
    this.numerator = numerator / a;
    this.denominator = denominator / a;
    Object.freeze(this);
  }

  static decimal(value: string): Rational {
    if (!isDecimal(value)) throw new RangeError("Invalid bounded decimal");
    const [whole, fraction = ""] = value.split(".");
    return new Rational(BigInt(whole + fraction), 10n ** BigInt(fraction.length));
  }

  add(other: Rational): Rational { return new Rational(this.numerator * other.denominator + other.numerator * this.denominator, this.denominator * other.denominator); }
  subtract(other: Rational): Rational { return this.add(new Rational(-other.numerator, other.denominator)); }
  multiply(other: Rational): Rational { return new Rational(this.numerator * other.numerator, this.denominator * other.denominator); }
  divide(other: Rational): Rational { return new Rational(this.numerator * other.denominator, this.denominator * other.numerator); }
  compare(other: Rational): number {
    const difference = this.numerator * other.denominator - other.numerator * this.denominator;
    return difference < 0n ? -1 : difference > 0n ? 1 : 0;
  }
  floor(): bigint {
    const quotient = this.numerator / this.denominator;
    return this.numerator < 0n && this.numerator % this.denominator !== 0n ? quotient - 1n : quotient;
  }
  ceil(): bigint { return -new Rational(-this.numerator, this.denominator).floor(); }
  isMultipleOf(step: Rational): boolean {
    if (step.numerator <= 0n) throw new RangeError("Step must be positive");
    return this.divide(step).denominator === 1n;
  }
  floorStep(step: Rational): Rational { return step.multiply(new Rational(this.dividePositiveStep(step).floor())); }
  ceilStep(step: Rational): Rational { return step.multiply(new Rational(this.dividePositiveStep(step).ceil())); }
  private dividePositiveStep(step: Rational): Rational {
    if (step.numerator <= 0n) throw new RangeError("Step must be positive");
    return this.divide(step);
  }
  toDecimal(): string {
    let remainder = this.denominator;
    let twos = 0;
    let fives = 0;
    while (remainder % 2n === 0n) { remainder /= 2n; twos++; }
    while (remainder % 5n === 0n) { remainder /= 5n; fives++; }
    if (remainder !== 1n) throw new RangeError("Non-terminating decimal");
    const places = Math.max(twos, fives);
    const magnitude = (this.numerator < 0n ? -this.numerator : this.numerator) * (10n ** BigInt(places) / this.denominator);
    const digits = magnitude.toString().padStart(places + 1, "0");
    const decimal = places === 0 ? digits : `${digits.slice(0, -places)}.${digits.slice(-places)}`.replace(/\.?0+$/, "");
    return `${this.numerator < 0n ? "-" : ""}${decimal}`;
  }
}

export function isDecimal(value: unknown, positive = false): value is string {
  if (typeof value !== "string" || value.length > 41 || !/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value)) return false;
  const digits = value.replace(".", "");
  if (digits.length > 40 || (value.split(".")[1]?.length ?? 0) > 18) return false;
  return !positive || /[1-9]/.test(digits);
}

export const ZERO = new Rational(0n);
export function minRational(...values: Rational[]): Rational {
  if (!values.length) throw new RangeError("Empty minimum");
  return values.reduce((a, b) => a.compare(b) <= 0 ? a : b);
}
export function maxRational(...values: Rational[]): Rational {
  if (!values.length) throw new RangeError("Empty maximum");
  return values.reduce((a, b) => a.compare(b) >= 0 ? a : b);
}
