import { CompoundLexType, Lexicon, LexRoot, XBar } from "../structure/xBar";
import { multi_test } from "../tools/tester";

const simpleSentence = new XBar(
  null as unknown,
  new CompoundLexType(LexRoot.Lexicon, LexRoot.Void)
);
const say = new XBar(
  (theme: (lex: Lexicon) => string) => (lex: Lexicon) =>
    console.log(theme(lex)),
  new CompoundLexType(
    new CompoundLexType(LexRoot.Lexicon, LexRoot.String),
    new CompoundLexType(LexRoot.Lexicon, LexRoot.Void)
  )
);
const numberStringTakingSentence = new XBar(
  null as unknown,
  new CompoundLexType(
    LexRoot.Number,
    new CompoundLexType(
      LexRoot.String,
      new CompoundLexType(LexRoot.Lexicon, LexRoot.Void)
    )
  )
);
const stringProvider = new XBar(
  () => "Hello World",
  new CompoundLexType(LexRoot.Lexicon, LexRoot.String)
);

multi_test(
  "XBar Types",
  [
    [simpleSentence, ["<Lexicon, Void>"]],
    [say, ["<<Lexicon, String>, <Lexicon, Void>>"]],
    [numberStringTakingSentence, ["<Number, <String, <Lexicon, Void>>>"]],
    [XBar.createParent(say, stringProvider), ["<Lexicon, Void>"]],
    [XBar.createParent(stringProvider, say), ["<Lexicon, Void>"]],
  ],
  (testXBar: XBar) => testXBar.typeString()
);

multi_test(
  "Fake XBar Running",
  [[XBar.createParent(say, stringProvider), ["Hello World"]]],
  (input: XBar) => input.run(new Lexicon())
);

test("Stringable Takes Test", () => {
  expect(
    new CompoundLexType(
      new CompoundLexType(LexRoot.Lexicon, LexRoot.Stringable),
      new CompoundLexType(LexRoot.Lexicon, LexRoot.Void)
    ).takes(new CompoundLexType(LexRoot.Lexicon, LexRoot.Number))
  ).toEqual(true);
  expect(
    new CompoundLexType(LexRoot.Lexicon, LexRoot.Stringable).equals(
      new CompoundLexType(LexRoot.Lexicon, LexRoot.Number)
    )
  ).toEqual(true);
});
