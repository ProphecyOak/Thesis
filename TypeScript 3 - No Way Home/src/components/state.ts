import {
  LexicalCategory,
  LexicalItemInterface,
  MeaningInterface,
  StateInterface,
} from "../header";

export { State };

class State implements StateInterface {
  private parent?: StateInterface;
  private symbolTable: Map<LexicalCategory, Map<string, LexicalItemInterface>>;

  constructor() {
    this.symbolTable = new Map<
      LexicalCategory,
      Map<string, LexicalItemInterface>
    >();
    for (let key in LexicalCategory) {
      let value = LexicalCategory[key as keyof typeof LexicalCategory];
      this.symbolTable.set(value, new Map<string, LexicalItemInterface>());
    }
  }

  isRoot(): boolean {
    return this.parent == undefined;
  }

  lookupSymbol(symbol: string, cat: LexicalCategory): LexicalItemInterface {
    let localResult = this.symbolTable.get(cat)?.get(symbol);
    if (localResult != undefined) return localResult;
    if (this.isRoot())
      throw new Error(`Word: ${symbol} is not found in category: ${cat}`);
    return (this.parent as StateInterface).lookupSymbol(symbol, cat);
  }

  childState(): StateInterface {
    throw new Error("State.childState() not implemented yet.");
  }

  parentState(): StateInterface {
    throw new Error("State.parentState() not implemented yet.");
  }

  addSymbol(
    symbol: string,
    cat: LexicalCategory,
    value: LexicalItemInterface
  ): void {
    this.symbolTable.get(cat)?.set(symbol, value);
  }
}
