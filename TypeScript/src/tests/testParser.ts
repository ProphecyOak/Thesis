import * as assert from "assert";
import { evaluate } from "../components/parser";

let results: string[] = new Array();
let oldConsole = console.log;
console.log = (x: string) => {
  results.push(x);
};

function strArr(arr: string[]): string {
  return arr.reduce((x: string, acc: string) => x + "\n" + acc);
}
function printArr(arr: string[]) {
  oldConsole(strArr(arr));
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
    } catch (error: any) {
      if (DEBUG) oldConsole(error);
      results.push("ERROR");
    }
    if (DEBUG) {
      printArr([name]);
      printArr(results);
      printArr(expected);
    }
    expect(results).toEqual(expected);
  });
}

describe("Recognization of numeral-based numbers", () => {
  testText("Say Number", "Say 23.", ["23"], true);
  testText("Say Number (2x)", "Say 23.\nSay 45.", ["23", "45"]);
});

describe("Recognization of strings", () => {
  testText("Say String single quotes", "Say '23'.", ["23"]);
  testText("Say String double quotes", 'Say "23".', ["23"]);
  testText("Say String bad quotes", "Say '23\".", ["ERROR"]);
  testText("Say String nested quote", "Say '2\"3'.\nSay \"2'3\"", [
    '2"3',
    "2'3",
  ]);
});

describe("Recognization of verbs", () => {
  testText("Recognize Say", "Say '23'.", ["23"]);
  testText("Don't Recognize Blgfgshodf", "Blgfgshodf 23", ["ERROR"]);
});

describe("Storing and Accessing variables", () => {
  testText("Basic set", "Set X to 2.", ["2"]);
});
