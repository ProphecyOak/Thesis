import { shellLex } from "../shell/shell_lexicon";
import { LexRoot } from "../structure/semantic_type";
import { Lexicon, XBar } from "../structure/xBar";
import { NaturalParser } from "../tools/parser";
import { multi_test } from "../tools/tester";

const testLex = new Lexicon(shellLex);

testLex.add(
  "TestVariable",
  new XBar(
    new Map<string, unknown>([["value", 34]]),
    LexRoot.ValueObject(LexRoot.Number),
    "TestVariable"
  )
);

function sentenceTest(text: string) {
  NaturalParser.evaluate(
    text,
    testLex,
    NaturalParser.parserRules.PARAGRAPH
  ).forEach((x) => x.run(testLex));
  return "FINISHED";
}

multi_test(
  "Basics",
  [
    ["Say 2.", ["2", "FINISHED"]],
    ["Bark.", ["Woof!", "FINISHED"]],
    ["Say 'stuff'.", ["stuff", "FINISHED"]],
    ["Say 'stuff' 2 times.", ["stuff", "stuff", "FINISHED"]],
  ],
  sentenceTest
);

multi_test(
  "Variables",
  [
    ["Say the value of TestVariable.", ["34", "FINISHED"]],
    ["Say TestVariable's value.", ["34", "FINISHED"]],
    ["Save 'stuff' as the value of theStringVariable.", ["FINISHED"]],
    [
      "Save 2 as the value of myNewVariable. Say the value of myNewVariable.",
      ["2", "FINISHED"],
    ],
  ],
  sentenceTest
);

multi_test(
  "For Loops",
  [
    [
      "Save 5 as the value of fiveVar. Say the value of fiveVar the value of fiveVar times.",
      ["5", "5", "5", "5", "5", "FINISHED"],
    ],
    [
      "Save 5 as the value of fiveVar. Say the value of fiveVar 5 times.",
      ["5", "5", "5", "5", "5", "FINISHED"],
    ],
    [
      "For each character in 'hello': bark.",
      ["Woof!", "Woof!", "Woof!", "Woof!", "Woof!", "FINISHED"],
    ],
    [
      "For each character in 'hello': Say 'boop'.",
      ["boop", "boop", "boop", "boop", "boop", "FINISHED"],
    ],
    [
      "For each character in 'hello': Say character's value.",
      ["h", "e", "l", "l", "o", "FINISHED"],
    ],
    [
      "For each character in 'aa': for each item in \"bob\": Say item's value.",
      ["b", "o", "b", "b", "o", "b", "FINISHED"],
    ],
  ],
  sentenceTest
);

multi_test(
  "Math",
  [
    [
      "Save 3 as myValue's value. Add 2 to myValue's value. Say myValue's value.",
      ["5", "FINISHED"],
    ],
    [
      "Save 3 as myValue's value. Add 2 to myValue's value 5 times. Say myValue's value.",
      ["13", "FINISHED"],
    ],
  ],
  sentenceTest
);

multi_test(
  "Conditionals",
  [
    ["If true: say 2.", ["2", "FINISHED"]],
    ["If 2 is 2: bark.", ["Woof!", "FINISHED"]],
  ],
  sentenceTest
);
