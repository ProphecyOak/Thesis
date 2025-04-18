import { CompoundLexType, Lexicon, LexRoot, XBar } from "../structure/xBar";
import { multi_test } from "../tools/tester";
import { getPrintableTree } from "../tools/tree_printer";

const simpleSentence = new XBar(
  null as unknown,
  new CompoundLexType(LexRoot.Lexicon, LexRoot.Void)
);
const say = new XBar(
  (theme: (lex: Lexicon) => { get: () => string }) => (lex: Lexicon) =>
    console.log(theme(lex).get()),
  new CompoundLexType(
    new CompoundLexType(LexRoot.Lexicon, LexRoot.String),
    new CompoundLexType(LexRoot.Lexicon, LexRoot.Void)
  ),
  "Say"
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
  () => ({ get: () => "Hello World" }),
  new CompoundLexType(LexRoot.Lexicon, LexRoot.String),
  "'Hello World'"
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

multi_test(
  "Printing Trees",
  [
    [
      XBar.createParent(say, stringProvider),
      [
        "Say 'Hello World' - <Lexicon, Void>\n" +
          "  ├─Say - <<Lexicon, String>, <Lexicon, Void>>\n" +
          "  └─'Hello World' - <Lexicon, String>\n",
      ],
    ],
  ],
  (xbar: XBar) => {
    console.log(getPrintableTree(xbar, XBar.toTree));
  }
);
