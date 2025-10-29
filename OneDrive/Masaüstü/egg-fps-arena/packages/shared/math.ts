export function quantizeFloat(value: number, min: number, max: number, bits: number): number {
  const range = max - min;
  const maxInt = (1 << bits) - 1;
  return Math.round(((value - min) / range) * maxInt);
}

export function dequantizeFloat(value: number, min: number, max: number, bits: number): number {
  const maxInt = (1 << bits) - 1;
  const range = max - min;
  return (value / maxInt) * range + min;
}
