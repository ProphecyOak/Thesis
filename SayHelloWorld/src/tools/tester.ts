export function multi_test<T, S>(
  name: string,
  tests: [T, S][],
  testFx: (input: T) => S
) {
  describe(name, () => {
    tests.forEach(([input, output]: [T, S], i: number) => {
      test(`Test ${i + 1}`, () => expect(testFx(input)).toEqual(output));
    });
  });
}

export function captureOutput<T>(output: string[], fx: () => T): T {
  const oldConsole = console.log;
  console.log = (x: string) => output.push(x);
  const fxResult = fx();
  console.log = oldConsole;
  return fxResult;
}
