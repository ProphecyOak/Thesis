export function multi_test<T, S>(
  name: string,
  tests: [T, [string | S]][],
  testFx: (input: T) => S
) {
  describe(name, () => {
    tests.forEach(([input, expected]: [T, [string | S]], i: number) => {
      const results = new Array<string | S>();
      captureOutput(results, () => testFx(input));
      test(`Test ${i + 1}`, () => expect(results).toEqual(expected));
    });
  });
}

export function captureOutput<T>(
  output: (string | T)[],
  fx: () => T
): (string | T)[] {
  const oldConsole = console.log;
  console.log = (x: string) => output.push(x);
  try {
    output.push(fx());
  } catch (e: unknown) {
    if (e instanceof Error) console.log(e.message);
  }
  console.log = oldConsole;
  return output;
}
