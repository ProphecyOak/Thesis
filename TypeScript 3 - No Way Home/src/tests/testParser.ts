import * as assert from "assert";
import { Rule } from "typescript-parsec";
import { MeaningInterface, parserRules, TreeNodeInterface } from "../header";
let results: (string | number)[] = new Array();
let oldConsole = console.log;
console.log = (x: string) => {
  results.push(x);
};

function testText<T>(
  name: string,
  prgm: string,
  nodeType: Rule<any, T>,
  expected: (string | number)[],
  runnable: boolean,
  DEBUG = false,
  testFx?: (node: T) => void
) {
  test(name, () => {
    results = [];
    const returnedPrgm: T = null as T; // EVALUATE FUNCTION GOES HERE
    if (runnable)
      null; // RUN THE RESULT
    else if (testFx != undefined) testFx(returnedPrgm);
    expect(results).toEqual(expected);
  });
}

describe("Basics", () => {
  testText(
    "String",
    "'Hello World'",
    parserRules.STRING_LITERAL,
    ["Hello World"],
    false,
    false,
    (node: string) => console.log(node)
  );
  testText(
    "Number",
    "45.23",
    parserRules.NUMERIC_LITERAL,
    [45.23],
    false,
    false,
    (node: number) => console.log(node)
  );
  testText(
    "Literal",
    "45.23",
    parserRules.LITERAL,
    [45.23],
    false,
    false,
    (node: MeaningInterface<any>) => {
      console.log(node.getMeaning());
    }
  );
});

describe("Say", () => {
  testText(
    "Saying a literal",
    "Say 45.23.",
    parserRules.SENTENCE,
    [45.23],
    true,
    false
  );
});
