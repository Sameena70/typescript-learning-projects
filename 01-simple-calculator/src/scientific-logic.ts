import { AngleMode } from './types.js';

export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error('Factorial requires a non-negative integer');
  }
  if (n > 170) {
    throw new Error('Overflow: value exceeds max factorial limit');
  }
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

export function toRadians(angle: number, mode: AngleMode): number {
  return mode === 'DEG' ? (angle * Math.PI) / 180 : angle;
}

export function fromRadians(rad: number, mode: AngleMode): number {
  return mode === 'DEG' ? (rad * 180) / Math.PI : rad;
}

export function safeSin(x: number, mode: AngleMode): number {
  if (mode === 'DEG') {
    const norm = Math.abs(x) % 360;
    if (norm === 0 || norm === 180) return 0;
  }
  const rad = toRadians(x, mode);
  const val = Math.sin(rad);
  return Math.abs(val) < 1e-15 ? 0 : val;
}

export function safeCos(x: number, mode: AngleMode): number {
  if (mode === 'DEG') {
    const norm = Math.abs(x) % 360;
    if (norm === 90 || norm === 270) return 0;
  }
  const rad = toRadians(x, mode);
  const val = Math.cos(rad);
  return Math.abs(val) < 1e-15 ? 0 : val;
}

export function safeTan(x: number, mode: AngleMode): number {
  if (mode === 'DEG') {
    const norm = Math.abs(x) % 180;
    if (norm === 90) throw new Error('Invalid input: tan is undefined at 90°');
  } else {
    const norm = Math.abs(x) % Math.PI;
    if (Math.abs(norm - Math.PI / 2) < 1e-14) {
      throw new Error('Invalid input: tan is undefined at π/2 rad');
    }
  }
  const sinVal = safeSin(x, mode);
  const cosVal = safeCos(x, mode);
  return sinVal / cosVal;
}

export function safeAsin(x: number, mode: AngleMode): number {
  if (x < -1 || x > 1) {
    throw new Error('Domain error: sin⁻¹ domain is [-1, 1]');
  }
  const rad = Math.asin(x);
  return fromRadians(rad, mode);
}

export function safeAcos(x: number, mode: AngleMode): number {
  if (x < -1 || x > 1) {
    throw new Error('Domain error: cos⁻¹ domain is [-1, 1]');
  }
  const rad = Math.acos(x);
  return fromRadians(rad, mode);
}

export function safeAtan(x: number, mode: AngleMode): number {
  const rad = Math.atan(x);
  return fromRadians(rad, mode);
}

export function safeLog10(x: number): number {
  if (x <= 0) {
    throw new Error('Domain error: log(x) requires x > 0');
  }
  return Math.log10(x);
}

export function safeLn(x: number): number {
  if (x <= 0) {
    throw new Error('Domain error: ln(x) requires x > 0');
  }
  return Math.log(x);
}

export function safeSqrt(x: number): number {
  if (x < 0) {
    throw new Error('Domain error: √x requires x ≥ 0');
  }
  return Math.sqrt(x);
}

export function safeCbrt(x: number): number {
  return Math.cbrt(x);
}

export function safeReciprocal(x: number): number {
  if (x === 0) {
    throw new Error('Cannot divide by zero');
  }
  return 1 / x;
}

export function safePower(base: number, exponent: number): number {
  if (base === 0 && exponent < 0) {
    throw new Error('Cannot divide by zero');
  }
  const result = Math.pow(base, exponent);
  if (!Number.isFinite(result) || Number.isNaN(result)) {
    throw new Error('Calculation overflow or invalid exponentiation');
  }
  return result;
}

export function safeModulo(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a % b;
}
