import * as assert from "assert";
import { evaluate, nodeTypes } from "../components/parser";
import { Rule } from "typescript-parsec";
import { TreeNode } from "../structures/tree_node";
import { SemanticState } from "../structures/semantic_state";

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
    const returnedPrgm = evaluate<T>(nodeType, prgm, DEBUG);
    if (runnable) (returnedPrgm as () => any)();
    else if (testFx != undefined) testFx(returnedPrgm);
    expect(results).toEqual(expected);
  });
}

describe("Basics", () => {
  testText(
    "String",
    "'Hello World'",
    nodeTypes.STRING_LITERAL,
    ["Hello World"],
    false,
    false,
    (node: string) => console.log(node)
  );
  testText(
    "Number",
    "45.23",
    nodeTypes.NUMERIC_LITERAL,
    [45.23],
    false,
    false,
    (node: number) => console.log(node)
  );
  testText(
    "Literal",
    "45.23",
    nodeTypes.LITERAL,
    [45.23],
    false,
    false,
    (node: TreeNode<any>) => {
      console.log(node.getValue());
    }
  );
});

describe("Say", () => {
  testText(
    "Saying a literal",
    "Say 45.23.",
    nodeTypes.SENTENCE,
    [45.23],
    false,
    false
  );
});
