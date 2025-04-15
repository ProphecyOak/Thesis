import {
  Lexicon,
  XBar,
  LexRoot,
  CompoundLexType,
  LexType,
} from "../structure/xBar";
import { NaturalParser } from "../tools/parser";
import { multi_test } from "../tools/tester";

const testLex = new Lexicon();

testLex.add(
  "Say",
  new XBar(
    (theme: (lex: Lexicon) => { get: () => string }) => (lex: Lexicon) => {
      console.log(theme(lex).get().toString());
    },
    new CompoundLexType(
      new CompoundLexType(LexRoot.Lexicon, LexRoot.Stringable),
      new CompoundLexType(LexRoot.Lexicon, LexRoot.Void)
    ),
    "Say"
  )
);

testLex.add(
  "Save",
  new XBar(
    (value: (lex: Lexicon) => { get: () => unknown; type: LexType }) =>
      (destination: { get: () => string }) =>
      (lex: Lexicon) => {
        lex.add(
          destination.get(),
          new XBar(
            { value: value(lex).get() },
            LexRoot.ValueObject(value(lex).type)
          )
        );
      },
    new CompoundLexType(
      new CompoundLexType(LexRoot.Lexicon, LexRoot.Stringable),
      new CompoundLexType(
        LexRoot.Stringable,
        new CompoundLexType(LexRoot.Lexicon, LexRoot.Void)
      )
    ),
    "Save"
  )
);

testLex.add(
  "Bark",
  new XBar(
    () => console.log("Woof!"),
    new CompoundLexType(LexRoot.Lexicon, LexRoot.Void),
    "Bark"
  )
);

testLex.add(
  "TestVariable",
  new XBar({ value: 34 }, LexRoot.ValueObject(LexRoot.Number), "TestVariable")
);

function sentenceTest(text: string) {
  NaturalParser.evaluate(
    text,
    testLex,
    NaturalParser.parserRules.PARAGRAPH
  ).run(testLex);
  return "FINISHED";
}

multi_test(
  "Basics",
  [
    ["Say 2.", ["2", "FINISHED"]],
    ["Bark.", ["Woof!", "FINISHED"]],
    ["Say 'stuff'.", ["stuff", "FINISHED"]],
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
