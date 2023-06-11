export function getClosestFibonacci(num: number) {
  const fibonacciNumbers = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
  const closest = fibonacciNumbers.reduce((a, b) => {
    return Math.abs(b - num) < Math.abs(a - num) ? b : a;
  });
  return closest;
}
