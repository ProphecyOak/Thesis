import { Lexicon, XBar, LexRoot } from "../structure/xBar";
import { NaturalParser } from "../tools/parser";
import { multi_test } from "../tools/tester";

const testLex = new Lexicon();

testLex.add(
  "Say",
  new XBar(
    (theme: (lex: Lexicon) => string) => (lex: Lexicon) =>
      console.log(theme(lex)),
    [LexRoot.String, LexRoot.Lexicon],
    LexRoot.Void,
    "Say"
  )
);

multi_test("Basics", [["Say 2.", ["2"]]], (text: string) =>
  NaturalParser.evaluate(text, testLex, NaturalParser.parserRules.SENTENCE)
);
