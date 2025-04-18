import {
  CompoundLexType,
  Lexicon,
  LexRoot,
  LexType,
  XBar,
} from "../structure/xBar";

export const shellLex = new Lexicon();

shellLex.add(
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

shellLex.add(
  "Bark",
  new XBar(
    () => console.log("Woof!"),
    new CompoundLexType(LexRoot.Lexicon, LexRoot.Void),
    "Bark"
  )
);
shellLex.add(
  "Save",
  new XBar(
    (value: (lex: Lexicon) => { get: () => unknown; type: LexType }) =>
      (destination: { get: () => string }) =>
      (lex: Lexicon) => {
        lex.add(
          destination.get(),
          new XBar(
            { value: value(lex).get() },
            LexRoot.ValueObject(value(lex).type),
            destination.get()
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

shellLex.add(
  "True",
  new XBar(
    () => ({ get: () => true }),
    new CompoundLexType(LexRoot.Lexicon, LexRoot.Boolean),
    "True"
  )
);
shellLex.add(
  "False",
  new XBar(
    () => ({ get: () => false }),
    new CompoundLexType(LexRoot.Lexicon, LexRoot.Boolean),
    "False"
  )
);

// TODO "For" Definition
