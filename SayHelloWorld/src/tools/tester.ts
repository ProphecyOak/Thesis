export function multi_test<T, S>(
  name: string,
  tests: [T, (string | S)[]][],
  testFx: (input: T) => S,
  throwEm = false
) {
  describe(name, () => {
    tests.forEach(([input, expected]: [T, (string | S)[]], i: number) => {
      const results = new Array<string | S>();
      captureOutput(results, () => testFx(input), throwEm);
      test(`Test ${i + 1}`, () => expect(results).toEqual(expected));
    });
  });
}

export function captureOutput<T>(
  output: (string | T)[],
  fx: () => T,
  throwEm: boolean,
  inShell = false
): (string | T)[] {
  const oldConsole = console.log;
  console.log = (x: string) => output.push(x);
  try {
    const result = fx();
    if (!inShell) output.push(result);
  } catch (e: unknown) {
    if (throwEm) throw e;
    if (e instanceof Error) console.log(`ERROR: ${e.message}`);
  }
  console.log = oldConsole;
  return output;
}

// TODO Add more tests (paragraph, numbers, strings, etc)
