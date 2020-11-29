export function randFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randBetween(low: number, high: number): number {
  return low + Math.floor(Math.random() * (high - low));
}
