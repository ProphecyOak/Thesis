import { Parser, rule, Rule } from "typescript-parsec";
import { evaluate } from "./parser";
import "../patterns/patternSetter";
import { SymbolTableInterface, TokenKind, XBarInterface } from "../header";
import { Value } from "./xValue";
import { testTable } from "./lexicon";

export {
  testText,
  multiTest,
  testPrint,
  customRule,
  testValue,
  testRun,
  testParagraph,
  captureOutput,
};

function captureOutput<T>(results: string[], fx: () => T): T {
  const oldConsole = console.log;
  console.log = (x: string) => {
    results.push(x);
  };
  const output = fx();
  console.log = oldConsole;
  return output;
}

function testText<T>(
  name: string,
  prgm: string,
  nodeType: Rule<TokenKind, T>,
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
      captureOutput(results, () => {
        try {
          testFx(output);
        } catch (error) {
          if (DEBUG) console.log(error);
          console.log("ERROR");
        }
      });
    expect(results).toEqual(expected);
  });
}

function multiTest<T>(
  name: string,
  tests: [string, (string | number)[]][],
  nodeType: Rule<TokenKind, T>,
  DEBUG = false,
  testFx?: (node: T) => void
) {
  describe(name, () => {
    let i = 1;
    tests.forEach(([prgm, expected]: [string, (string | number)[]]) => {
      testText(`Test ${i}`, prgm, nodeType, expected, DEBUG, testFx);
      i++;
    });
  });
}

function testPrint(thing: unknown): void {
  console.log(thing);
}
function testValue(value: Value<unknown>) {
  testPrint(value.getValue()());
}

function testRun(value: XBarInterface) {
  value.assignLookup(testTable);
  (value.root.getValue()() as XBarInterface).assignLookup(testTable).run();
}

function testParagraph(value: (lookup: SymbolTableInterface<unknown>) => void) {
  value(testTable);
}

function customRule<T>(parser: Parser<TokenKind, T>) {
  const newRule = rule<TokenKind, T>();
  newRule.setPattern(parser);
  return newRule;
}
