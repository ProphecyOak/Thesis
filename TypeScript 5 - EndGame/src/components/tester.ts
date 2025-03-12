import { Parser, rule, Rule, Token } from "typescript-parsec";
import { evaluate } from "./parser";
import "../patterns/patternSetter";
import { TokenKind } from "../header";
import { Value } from "./xValue";

export { testText, multiTest, testPrint, customRule, testValue };

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
    const output = captureOutput(results, () => {
      try {
        return evaluate(nodeType, prgm, DEBUG);
      } catch (error) {
        if (DEBUG) console.log(error);
        console.log("ERROR");
      }
    });
    if (output != null && testFx != undefined)
      captureOutput(results, () => testFx(output));
    expect(results).toEqual(expected);
  });
}

function multiTest<T>(
  name: string,
  tests: Map<string, (string | number)[]>,
  nodeType: Rule<any, T>,
  DEBUG = false,
  testFx?: (node: T) => void
) {
  describe(name, () => {
    let i = 1;
    tests.forEach((expected: (string | number)[], prgm: string) => {
      testText(`Test ${i}`, prgm, nodeType, expected, DEBUG, testFx);
      i++;
    });
  });
}

function testPrint(thing: any): void {
  console.log(thing);
}
function testValue(value: Value<any>) {
  testPrint(value.getValue()());
}

function customRule(parser: Parser<TokenKind, any>) {
  let newRule = rule<TokenKind, Token<TokenKind>>();
  newRule.setPattern(parser);
  return newRule;
}
