function fib(n, a = 0, b = 1) {
  return n > 0 ? fib(n - 1, b, a + b) : a;
}

const ret = fib(10);

console.log(ret);
