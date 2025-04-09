import { Lexicon, LexRoot, XBar } from "../structure/xBar";
import { multi_test } from "../tools/tester";

const testLex = new Lexicon();

const simpleSentence = new XBar(
  null as unknown,
  [LexRoot.Lexicon],
  LexRoot.Void
);
const say = new XBar(
  (theme: (lex: Lexicon) => string) => (lex: Lexicon) =>
    console.log(theme(lex)),
  [LexRoot.String, LexRoot.Lexicon],
  LexRoot.Void
);
const numberStringTakingSentence = new XBar(
  null as unknown,
  [LexRoot.Number, LexRoot.String, LexRoot.Lexicon],
  LexRoot.Void
);
const stringProvider = new XBar(
  () => "Hello World",
  [LexRoot.Lexicon],
  LexRoot.String
);

multi_test(
  "Adding to lex and grabbing back the values",
  [
    [["A", simpleSentence], [simpleSentence]],
    [["B", say], [say]],
    [["C", numberStringTakingSentence], [numberStringTakingSentence]],
    [["D", stringProvider], [stringProvider]],
    [["A", stringProvider], [stringProvider]],
  ],
  ([name, newItem]: [string, XBar]) => {
    testLex.add(name, newItem);
    return testLex.lookup(name);
  }
);
