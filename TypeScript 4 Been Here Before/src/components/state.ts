import {
  SemVar,
  BlockInterface,
  VerbInterface,
  Argument,
  ArgumentValue,
  StoredVerb,
} from "../header";

export { Block };

class Block implements BlockInterface {
  private parent?: BlockInterface;
  private symbolTable: Map<string, SemVar | StoredVerb>;

  private sentences = new Array<VerbInterface>();

  constructor() {
    this.symbolTable = new Map<string, SemVar>();
  }

  isRoot(): boolean {
    return this.parent == undefined;
  }

  getChild(): BlockInterface {
    throw new Error("State.childState() not implemented yet.");
  }

  getParent(): BlockInterface {
    throw new Error("State.parentState() not implemented yet.");
  }

  lookupSymbol(symbol: string): SemVar | StoredVerb {
    let localResult = this.symbolTable.get(symbol);
    if (localResult != undefined) return localResult;
    if (this.isRoot()) throw new Error(`Word: ${symbol} is not found.`);
    return (this.parent as BlockInterface).lookupSymbol(symbol);
  }

  addSymbol(symbol: string, value: SemVar): void {
    this.symbolTable.set(symbol, value);
  }

  addSentence(verb: VerbInterface): void {
    this.sentences.push(verb);
    verb.setBlock(this);
  }
}
