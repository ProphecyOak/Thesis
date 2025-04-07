import { Lexicon, LexRoot, XBar } from "../structures/xBar";
import { captureOutput, multi_test } from "../tools/tester";

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
  "XBar Types",
  [
    [simpleSentence, "<Lexicon, Void>"],
    [say, "<String, <Lexicon, Void>>"],
    [numberStringTakingSentence, "<Number, <String, <Lexicon, Void>>>"],
    [XBar.createParent(say, stringProvider), "<Lexicon, Void>"],
    [XBar.createParent(stringProvider, say), "<Lexicon, Void>"],
  ],
  (testXBar: XBar) => testXBar.typeString()
);

multi_test(
  "Fake XBar Running",
  [[XBar.createParent(say, stringProvider), "Hello World"]],
  (input: XBar) => {
    const output = new Array<string>();
    captureOutput(output, () => input.run(new Lexicon()));
    return output.join("\n");
  }
);
