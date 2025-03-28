import { Argument, SymbolTable, VariableMeaning } from "../header";
import { XBar } from "./wordArgument";
import { LexValue, LitValue } from "./xValue";

export { testTable, SymbolTable };

let testTable: SymbolTable<VariableMeaning> = {
  words: new Map<string, VariableMeaning>([
    // [
    //   "Bark",
    //   (_value: LexValue<any>) => {
    //     return () => console.log("Woof");
    //   },
    // ],
    // [
    //   "Report",
    //   (_value: LexValue<any>) => {
    //     return () => console.log("Breaking News: This might actually work!");
    //   },
    // ],
    [
      "Bark",
      (rest: string) =>
        new XBar(
          new LitValue(() => console.log("Woof")).setRest(rest),
          testTable
        ),
    ],
    [
      "Say",
      () =>
        new XBar(
          new LitValue((theme: string | number) => console.log(theme)),
          testTable
        ).acceptArgument(Argument.Theme, "Say"),
    ],
    ["testVARIABLE", () => 2],
    // [
    //   "Save",
    //   (value: LexValue<any>) => {
    //     return () => {
    //       new XBar(value, testTable)
    //         .acceptArgument(
    //           Argument.Theme,
    //           new LitValue<any>((theme: string | number) =>
    //             console.log(theme.toString())
    //           )
    //         )
    //         .acceptArgument(
    //           Argument.Destination,
    //           new LitValue<any>((destination: LexValue<any>) => {
    //             testTable.add(
    //               destination.getSymbol(),
    //               (val: LexValue<any>) => () => theme
    //             );
    //           }, "At")
    //         )
    //         .run();
    //     };
    //   },
    // ],
  ]),
  lookup(symbol: string): VariableMeaning {
    if (this.words.get(symbol) == undefined) {
      throw new Error(`'${symbol}' is not defined in the lexicon.`);
    }
    return this.words.get(symbol)!;
  },
  add(destination: string, value: VariableMeaning) {
    // console.debug(`Adding ${destination} with meaning: ${value}`);
    this.words.set(destination, value);
  },
};

// function grabArgument(
//   root: Value<any>,
//   argType: Argument,
//   value: LitValue<any>,
//   lookupTable: SymbolTable<any>
// ): MergeValue<any, any> {
//   const frame = ArgumentFrame.getFrame(argType, value, lookupTable);
//   try {
//     return expectSingleResult(
//       expectEOF(frame.parse(lexer.parse(root.getRest())))
//     );
//   } catch (e) {
//     throw new Error(
//       `Grabbing argument of type ${Argument[argType]} for ${root.getSymbol()} with rest: {${root.getRest()}}\nError: ${e}`
//     );
//   }
// }
