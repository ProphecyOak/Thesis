import { Lexicon, XBar, LexRoot, CompoundLexType } from "../structure/xBar";
import { NaturalParser } from "../tools/parser";
import { multi_test } from "../tools/tester";

const testLex = new Lexicon();

testLex.add(
  "Say",
  new XBar(
    (theme: (lex: Lexicon) => string) => (lex: Lexicon) =>
      console.log(theme(lex).toString()),
    new CompoundLexType(
      new CompoundLexType(LexRoot.Lexicon, LexRoot.Stringable),
      new CompoundLexType(LexRoot.Lexicon, LexRoot.Void)
    ),
    "Say"
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
  new XBar(
    () => ({ value: 34 }),
    new CompoundLexType(LexRoot.Void, LexRoot.ValueObject(LexRoot.Number)),
    "TestVariable"
  )
);

function sentenceTest(text: string) {
  NaturalParser.evaluate(text, testLex, NaturalParser.parserRules.SENTENCE).run(
    testLex
  );
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
  [["Say the value of TestVariable.", ["34", "FINISHED"]]],
  sentenceTest
);
