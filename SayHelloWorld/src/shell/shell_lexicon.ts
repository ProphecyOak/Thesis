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
        const variableName = destination.get();
        const variableValue = value(lex);
        lex.modify(
          variableName,
          "value",
          variableValue.get(),
          variableValue.type
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
    () => ({ get: () => true, type: LexRoot.Boolean }),
    new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Boolean),
    "True"
  )
);

// Is the base boolean value of False.
shellLex.add(
  "False",
  new XBar(
    () => ({ get: () => false, type: LexRoot.Boolean }),
    new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Boolean),
    "False"
  )
);

// STRETCH use Memoized For Loops (notes)
// Might need to do in composeEmAll

type myIterable = Array<string>;
shellLex.add(
  "For",
  new XBar(
    (iterator: { get: () => string }) =>
      (iterable: { get: () => myIterable }) =>
      (task: (lex: Lexicon) => (lex: Lexicon) => void) =>
      (lex: Lexicon) => {
        const iteratorName = iterator.get();
        const smallLex = new Lexicon(lex);
        const iterableValues = iterable.get();
        smallLex.modify(
          iteratorName,
          "value",
          iterableValues[0],
          LexRoot.String
        );
        const lexedTask = task(smallLex);
        for (let i = 0; i < iterableValues.length; i++) {
          smallLex.modify(
            iteratorName,
            "value",
            iterableValues[i],
            LexRoot.String
          );
          lexedTask(smallLex);
        }
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

shellLex.add(
  "While",
  new XBar(
    (condition: (lex: Lexicon) => { get: () => boolean }) =>
      (task: (lex: Lexicon) => (lex: Lexicon) => void) =>
      (lex: Lexicon) => {
        const smallLex = new Lexicon(lex);

        const lexedTask = task(smallLex);
        while (condition(smallLex).get()) {
          lexedTask(smallLex);
        }
      },
    new CompoundSemanticType(
      new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Boolean),
      new CompoundSemanticType(
        new CompoundSemanticType(
          LexRoot.Lexicon,
          new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
        ),
        new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
      )
    ),
    "While"
  )
);

function addHelper(a: unknown, b: unknown) {
  if (typeof a == "string" && typeof b == "string") return a + b;
  if (typeof a == "number" && typeof b == "number") return a + b;
  throw new Error(`Sorry, but '${typeof a}' cannot be added to ${typeof b}`);
}

shellLex.add(
  "Add",
  new XBar(
    (firstArg: (lex: Lexicon) => { get: () => unknown; type: SemanticType }) =>
      (
        secondArg: (lex: Lexicon) => { get: () => unknown; type: SemanticType }
      ) =>
      (lex: Lexicon) => {
        return addHelper(firstArg(lex).get(), secondArg(lex).get());
      },
    new CompoundSemanticType(
      new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Stringable),
      new CompoundSemanticType(
        new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Stringable),
        new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Stringable)
      )
    ),
    "Add"
  )
);

shellLex.add(
  "If",
  new XBar(
    (condition: (lex: Lexicon) => { get: () => boolean }) =>
      (task: (lex: Lexicon) => (lex: Lexicon) => void) =>
      (lex: Lexicon) =>
        condition(lex).get() ? task(lex)(lex) : () => null,
    new CompoundSemanticType(
      new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Boolean),
      new CompoundSemanticType(
        new CompoundSemanticType(
          LexRoot.Lexicon,
          new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
        ),
        new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
      )
    ),
    "If"
  )
);
