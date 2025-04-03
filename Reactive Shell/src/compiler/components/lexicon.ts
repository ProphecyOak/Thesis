import {
  Argument,
  SymbolTableInterface,
  VariableMeaning,
  XBarInterface,
} from "../header";
import { XBar } from "./wordArgument";
import { LitValue, Value } from "./xValue";

export { testTable, SymbolTable };

class SymbolTable implements SymbolTableInterface<VariableMeaning> {
  words: Map<string, VariableMeaning> = new Map<string, VariableMeaning>();
  parent?: SymbolTable;

  constructor(parent?: SymbolTable) {
    this.parent = parent;
  }

  lookup(symbol: string): VariableMeaning {
    if (this.words.has(symbol)) return this.words.get(symbol)!;
    if (this.parent == undefined)
      throw new Error(`{${symbol}} is not defined in the lexicon.`);
    return this.parent.lookup(symbol);
  }
  has(symbol: string): boolean {
    return (
      this.words.has(symbol) ||
      (this.parent != undefined ? this.parent.has(symbol) : false)
    );
  }
  add(destination: string, value: VariableMeaning): void {
    // console.debug(`Storing ${value} at destination: ${destination}`);
    this.words.set(destination, value);
  }
  createVerb(symbol: string, argTypes: Argument[], fx: () => unknown): void {
    this.add(
      symbol,
      (value: Value<unknown>) => () =>
        argTypes
          .reduce(
            (acc: XBar, e: Argument) => acc.acceptArgument(e),
            new XBar(
              new LitValue(fx, `${symbol}Meaning`).setRest(value.getRest()),
              this
            )
          )
          .optionalArgument(Argument.Multiplier)
    );
  }
  createConstant(symbol: string, value: string | number | boolean): void {
    this.add(symbol, () => () => value);
  }
}

const testTable = new SymbolTable();
testTable.createConstant("true", true);
testTable.createConstant("false", false);
testTable.createConstant("testVARIABLE", 2);
testTable.createVerb("Bark", [], () => console.log("Woof"));
testTable.createVerb(
  "Say",
  [Argument.Theme],
  () => (theme: string | number | boolean) => console.log(theme.toString())
);
testTable.createVerb(
  "Save",
  [Argument.Theme, Argument.Destination],
  () => (theme: string | number | boolean) => (destination: string) =>
    testTable.add(destination, () => () => theme)
);
testTable.createVerb(
  "For",
  [Argument.Iterator, Argument.Iterable, Argument.Body],
  () => (iterator: string) => (iterable: string) => (body: XBar) => {
    const parentLex = body.lookup;
    const localLex = new SymbolTable(parentLex);
    Array.from(iterable).forEach((char: string) => {
      localLex.createConstant(iterator, char);

      body.assignLookup(localLex);
      (body.root.getValue()() as XBarInterface).assignLookup(localLex).run();
    });
  }
);
