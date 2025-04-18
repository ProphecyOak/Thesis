import {
  CompoundSemanticType,
  LexRoot,
  SemanticType,
} from "../structure/semantic_type";
import { Lexicon, XBar } from "../structure/xBar";

export const shellLex = new Lexicon();

// Takes in a theme (of type lex=>stringable) and prints it.
shellLex.add(
  "Say",
  new XBar(
    (theme: (lex: Lexicon) => { get: () => string }) => (lex: Lexicon) => {
      console.log(theme(lex).get().toString());
    },
    new CompoundSemanticType(
      new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Stringable),
      new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
    ),
    "Say"
  )
);

// Takes in no arguments and prints "Woof!"
shellLex.add(
  "Bark",
  new XBar(
    () => console.log("Woof!"),
    new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void),
    "Bark"
  )
);

// Takes in a value (of type lex=>unknown) and saves it to the
// destination's (variable name's) value.
shellLex.add(
  "Save",
  new XBar(
    (value: (lex: Lexicon) => { get: () => unknown; type: SemanticType }) =>
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
    new CompoundSemanticType(
      new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Stringable),
      new CompoundSemanticType(
        LexRoot.Stringable,
        new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
      )
    ),
    "Save"
  )
);

// Is the base boolean value of True.
shellLex.add(
  "True",
  new XBar(
    () => ({ get: () => true }),
    new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Boolean),
    "True"
  )
);

// Is the base boolean value of False.
shellLex.add(
  "False",
  new XBar(
    () => ({ get: () => false }),
    new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Boolean),
    "False"
  )
);

// TODO "For" Definition
type myIterable = Array<string>;
shellLex.add(
  "For",
  new XBar(
    (iterator: { get: () => string }) =>
      (iterable: { get: () => myIterable }) =>
      (task: (lex: Lexicon) => XBar) =>
      (lex: Lexicon) => {
        const iteratorName = iterator.get();
        const smallLex = new Lexicon(lex);
        iterable.get().forEach((element: string) => {
          smallLex.add(
            iteratorName,
            new XBar(
              () => ({
                get: () => element,
              }),
              new CompoundSemanticType(LexRoot.Lexicon, LexRoot.String),
              `${element}`
            )
          );
          task(smallLex).run(smallLex);
        });
      },
    new CompoundSemanticType(
      LexRoot.String,
      new CompoundSemanticType(
        LexRoot.Iterable,
        new CompoundSemanticType(
          new CompoundSemanticType(
            LexRoot.Lexicon,
            new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
          ),
          new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
        )
      )
    ),
    "For"
  )
);
