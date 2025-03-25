import { expectSingleResult, expectEOF, amb } from "typescript-parsec";
import { Argument } from "../header";
import { lexer } from "./parser";
import { ArgumentFrame } from "./wordArgument";
import { LexValue, LitValue, MergeMode, MergeValue, Value } from "./xValue";

export { testTable, SymbolTable };

interface SymbolTable<T> {
  words: Map<string, T>;
  lookup(symbol: string): T;
  add(destination: string, value: VariableMeaning): void;
}

type VariableMeaning = (value: LexValue<any>) => () => void | string | number;
let testTable: SymbolTable<VariableMeaning> = {
  words: new Map<string, VariableMeaning>([
    [
      "Bark",
      (_value: LexValue<any>) => {
        return () => console.log("Woof");
      },
    ],
    [
      "Report",
      (_value: LexValue<any>) => {
        return () => console.log("Breaking News: This might actually work!");
      },
    ],
    [
      "Say",
      (value: LexValue<any>) => {
        return () => {
          const themeGrabbed = grabArgument(
            value,
            Argument.Theme,
            new LitValue(
              (theme: string | number) => console.log(theme.toString()),
              "Say"
            ),
            testTable
          );
          themeGrabbed.getValue()();
        };
      },
    ],
    ["testVARIABLE", (value: LexValue<any>) => () => 2],
    [
      "Save",
      (value: LexValue<any>) => {
        return () => {
          const themeGrabbed = grabArgument(
            value,
            Argument.Theme,
            new LitValue((theme: string | number) => {
              const destinationGrabbed = grabArgument(
                themeGrabbed,
                Argument.Destination,
                new LitValue((destination: LexValue<any>) => {
                  testTable.add(
                    destination.getSymbol(),
                    (val: LexValue<any>) => () => theme
                  );
                }, "At"),
                testTable
              );
              destinationGrabbed.getValue()();
            }, "Save"),
            testTable
          );
          themeGrabbed.getValue()();
        };
      },
    ],
  ]),
  lookup(symbol: string): VariableMeaning {
    return this.words.get(symbol)!;
  },
  add(destination: string, value: VariableMeaning) {
    // console.debug(`Adding ${destination} with meaning: ${value}`);
    this.words.set(destination, value);
  },
};

function grabArgument(
  root: Value<any>,
  argType: Argument,
  value: LitValue<any>,
  lookupTable: SymbolTable<any>
): MergeValue<any, any> {
  const frame = ArgumentFrame.getFrame(argType, value, lookupTable);
  try {
    return expectSingleResult(
      expectEOF(frame.parse(lexer.parse(root.getRest())))
    );
  } catch (e) {
    throw new Error(
      `Grabbing argument of type ${Argument[argType]} for ${root.getSymbol()} with rest: {${root.getRest()}}\nError: ${e}`
    );
  }
}

// function _grabArgument(
//   argType: Argument,
//   table: SymbolTable<any>,
//   vBar: Value<any>
// ): MergeValue<any, any> {
//   return null as unknown as MergeValue<any, any>;
// }

// class Sentence {
//   verb: LexValue<any>;
//   constructor(verb: LexValue<any>) {
//     this.verb = verb;
//   }
//   useArgument(argType: Argument) {}
// }
