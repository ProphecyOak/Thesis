import * as assert from "assert";
import { evaluate } from "../components/parser";
let results: string[] = new Array();
let oldConsole = console.log;
console.log = (x: string) => {
  results.push(x);
};

function strArr(arr: string[]): string {
  return results.reduce((x: string, acc: string) => x + "\n" + acc);
}
function printResults() {
  oldConsole(strArr(results));
}

function testText(
  name: string,
  prgm: string,
  expected: string[],
  DEBUG = false
) {
  test(name, () => {
    results = [];
    try {
      evaluate(prgm)();
    } catch {
      results.push("ERROR");
    }
    if (DEBUG) printResults();
    assert.ok(strArr(results) == strArr(expected));
  });
}

describe("Recognization of numeral-based numbers", () => {
  testText("Parser: Say Number", "Say 23.", ["23"]);
  testText("Parser: Say Number (2x)", "Say 23.\nSay 45.", ["23", "45"]);
});

describe("Recognization of strings", () => {
  testText("Parser: Say String single quotes", "Say '23'.", ["23"]);
  testText("Parser: Say String double quotes", 'Say "23".', ["23"]);
  testText("Parser: Say String bad quotes", "Say '23\".", ["ERROR"]);
  testText("Parser: Say String nested quote", "Say '2\"3'.\nSay \"2'3\"", [
    '2"3',
    "2'3",
  ]);
});
