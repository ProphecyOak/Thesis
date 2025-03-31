import { Argument, SymbolTable, VariableMeaning } from "../header";
import { XBar } from "./wordArgument";
import { LitValue, Value } from "./xValue";

export { testTable, SymbolTable };

let testTable: SymbolTable<VariableMeaning> = {
  words: new Map<string, VariableMeaning>([
    [
      "Bark",
      (value: Value<any>) => () =>
        new XBar(
          new LitValue(() => console.log("Woof"), "BarkMeaning").setRest(
            value.getRest()
          ),
          testTable
        ),
    ],
    [
      "Say",
      (value: Value<any>) => () =>
        new XBar(
          new LitValue(
            () => (theme: string | number) => console.log(theme.toString()),
            "SayMeaning"
          ).setRest(value.getRest()),
          testTable
        ).acceptArgument(Argument.Theme),
    ],
    ["testVARIABLE", (value: Value<any>) => () => 2],
    [
      "Save",
      (value: Value<any>) => () =>
        new XBar(
          new LitValue(
            () => (theme: string | number) => (destination: string) =>
              testTable.add(destination, (val: Value<any>) => () => theme),
            "SaveMeaning"
          ).setRest(value.getRest()),
          testTable
        )
          .acceptArgument(Argument.Theme)
          .acceptArgument(Argument.Destination),
    ],
  ]),
  lookup(symbol: string): VariableMeaning {
    if (this.words.get(symbol) == undefined) {
      throw new Error(`'${symbol}' is not defined in the lexicon.`);
    }
    return this.words.get(symbol)!;
  },
  add(destination: string, value: VariableMeaning) {
    // console.debug(`Storing ${value} at destination: ${destination}`);
    this.words.set(destination, value);
  },
};
