import { Rule } from "typescript-parsec";
import { evaluate } from "./parser";
import "../patterns/patternSetter";

export { testText, testPrint };

function captureOutput<T>(results: string[], fx: () => T): T {
  let oldConsole = console.log;
  console.log = (x: string) => {
    results.push(x);
  };
  let output = fx();
  console.log = oldConsole;
  return output;
}

function testText<T>(
  name: string,
  prgm: string,
  nodeType: Rule<any, T>,
  expected: (string | number)[],
  DEBUG = false,
  testFx?: (node: T) => void
) {
  test(name, () => {
    const results = new Array<string>();
    const output = captureOutput(results, () =>
      evaluate(nodeType, prgm, DEBUG)
    );
    if (testFx != undefined) captureOutput(results, () => testFx(output));
    expect(results).toEqual(expected);
  });
}

function testPrint(thing: any): void {
  console.log(thing);
}
