import { expectEOF, expectSingleResult } from "typescript-parsec";
import { CompoundLexType, Lexicon, LexRoot, XBar } from "../structure/xBar";
import { NaturalParser } from "../tools/parser";
import { multi_test } from "../tools/tester";

const testLex = new Lexicon();

testLex.add(
  "Say",
  new XBar(
    (theme: (lex: Lexicon) => string) => (lex: Lexicon) =>
      console.log(theme(lex)),
    new CompoundLexType(
      new CompoundLexType(LexRoot.Lexicon, LexRoot.String),
      new CompoundLexType(LexRoot.Lexicon, LexRoot.Void)
    ),
    "Say"
  )
);

multi_test(
  "Recognizing words",
  [
    ["Blorsnick", ["ERROR: Symbol 'blorsnick' is undefined in this scope."]],
    ["Say", [testLex.lookup("Say")]],
  ],
  (text: string) =>
    testLex.lookup(
      expectSingleResult(
        expectEOF(
          NaturalParser.parserRules.WORD.parse(NaturalParser.lexer.parse(text))
        )
      ).symbol
    )
);
