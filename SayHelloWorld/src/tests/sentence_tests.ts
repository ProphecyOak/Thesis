import { shellLex } from "../shell/shell_lexicon";
import { LexRoot } from "../structure/semantic_type";
import { Lexicon, XBar } from "../structure/xBar";
import { NaturalParser } from "../tools/parser";
import { multi_test } from "../tools/tester";

const testLex = new Lexicon(shellLex);

testLex.add(
  "TestVariable",
  new XBar({ value: 34 }, LexRoot.ValueObject(LexRoot.Number), "TestVariable")
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
      "For each character in 'hello': Say character's value.",
      ["h", "e", "l", "l", "o", "FINISHED"],
    ],
  ],
  sentenceTest
);
