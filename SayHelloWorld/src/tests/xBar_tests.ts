import { CompoundSemanticType, LexRoot } from "../structure/semantic_type";
import { Lexicon, XBar } from "../structure/xBar";
import { multi_test } from "../tools/tester";
import { getPrintableTree } from "../tools/tree_printer";

const simpleSentence = new XBar(
  null as unknown,
  new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
);
const say = new XBar(
  (theme: (lex: Lexicon) => { get: () => string }) => (lex: Lexicon) =>
    console.log(theme(lex).get()),
  new CompoundSemanticType(
    new CompoundSemanticType(LexRoot.Lexicon, LexRoot.String),
    new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
  ),
  "Say"
);
const numberStringTakingSentence = new XBar(
  null as unknown,
  new CompoundSemanticType(
    LexRoot.Number,
    new CompoundSemanticType(
      LexRoot.String,
      new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
    )
  )
);
const stringProvider = new XBar(
  () => ({ get: () => "Hello World" }),
  new CompoundSemanticType(LexRoot.Lexicon, LexRoot.String),
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
    new CompoundSemanticType(
      new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Stringable),
      new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
    ).takes(new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Number))
  ).toEqual(true);
  expect(
    new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Stringable).equals(
      new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Number)
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
