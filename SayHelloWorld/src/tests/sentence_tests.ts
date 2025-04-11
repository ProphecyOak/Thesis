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

multi_test(
  "Basics",
  [
    ["Say 2.", ["2", "FINISHED"]],
    ["Bark.", ["Woof!", "FINISHED"]],
    ["Say 'stuff'.", ["stuff", "FINISHED"]],
  ],
  (text: string) => {
    NaturalParser.evaluate(
      text,
      testLex,
      NaturalParser.parserRules.SENTENCE
    ).run(testLex);
    return "FINISHED";
  }
);
