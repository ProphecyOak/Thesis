import { getPrintableTree } from "../tools/tree_printer";
import { SemanticType, CompoundSemanticType, LexRoot } from "./semantic_type";

export class XBar {
  // Contains the value of this XBar.
  readonly value: unknown;
  // Type of this XBar's value.
  readonly type: SemanticType;
  // Text represented by this XBar.
  readonly symbol: string;

  // Child XBars
  children?: XBar[];

  constructor(value: unknown, type: SemanticType, symbol?: string) {
    this.value = value;
    this.type = type;
    this.symbol = symbol ? symbol : "";
  }

  // If the type of this XBar's value is (lex: ILexicon)=>void, then runs it.
  run(lexicon: Lexicon): void {
    if (
      !this.type.equals(new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void))
    )
      throw new Error(`This XBar is of type: ${this.type.toString()}`);
    (this.value as (lexicon: Lexicon) => void)(lexicon);
  }

  // Returns a string representation of the XBar's value's type signature.
  typeString(): string {
    return this.type.toString();
  }

  // Creates a new XBar with first and second as it's children if they can compose.
  static createParent(first: XBar, second: XBar): XBar {
    const thisIsFX = first.type.takes(second.type);
    if (!thisIsFX && !second.type.takes(first.type))
      throw new Error(
        `XBars of types ${first.typeString()} and ${second.typeString()} cannot compose:\n` +
          `Tree 1:\n${getPrintableTree(first, XBar.toTree)}\n` +
          `Tree 2:\n${getPrintableTree(second, XBar.toTree)}\n`
      );
    const fx = thisIsFX ? first : second;
    const arg = thisIsFX ? second : first;
    if (!(fx.type instanceof CompoundSemanticType))
      throw new Error(`Type ${fx.type.toString()} cannot be a function.`);
    const newXBar = new XBar(
      (fx.value as (arg: unknown) => unknown)(arg.value),
      fx.type.output,
      `${first.symbol} ${second.symbol}`
    );
    newXBar.children = [first, second];
    return newXBar;
  }

  // Utility function that converts an XBar to match the node
  // interface required for the treePrinter tool
  static toTree(xbar: XBar): { label: string; children: XBar[] } {
    return {
      label:
        (xbar.symbol != "" ? xbar.symbol : "missing") +
        ` - ${xbar.typeString()}`,
      children: xbar.children == undefined ? [] : xbar.children,
    };
  }
}

// An interface for the lexicon.
interface ILex {
  // Returns the XBar stored under a given symbol in the current or any parent scope.
  lookup(symbol: string): XBar;

  // Stores the XBar in the current scope (at the lowest level) under the given symbol.
  add(symbol: string, value: XBar): void;

  // Returns whether the current scope or any parent scope
  // contains an entry for the given symbol.
  has(symbol: string): boolean;

  // Modifies an existing variable if possible otherwise creates it.
  modify(
    symbol: string,
    property: string,
    value: unknown,
    type: SemanticType
  ): void;
  get entries(): string[];
}

// An empty lexicon only used for the base case of checking the parent scope.
const emptyLex: ILex = {
  lookup(symbol: string): XBar {
    throw new Error(`Symbol '${symbol}' is undefined in this scope.`);
  },
  add(): void {
    throw new Error(`Symbol cannot be added to a null parent.`);
  },
  has: function (): boolean {
    return false;
  },
  modify: function (): void {
    throw new Error("Variable cannot be modified in a null parent.");
  },
  get entries() {
    return [] as string[];
  },
};

// The main lexicon class.
export class Lexicon implements ILex {
  private _parent?: ILex;
  private _entries = new Map<string, XBar>();

  // A getter that returns the empty lex for the highest level scope.
  get parent() {
    if (this._parent == undefined) return emptyLex;
    return this._parent;
  }

  constructor(parent?: ILex) {
    this._parent = parent;
  }

  get entries() {
    return Array.from(this._entries.keys()).concat(this.parent.entries);
  }

  modify(
    symbol: string,
    property: string,
    value: unknown,
    type?: SemanticType
  ): void {
    if (this.has(symbol)) {
      (this.lookup(symbol).value as Map<string, unknown>).set(property, value);
    } else {
      if (type == undefined)
        throw new Error(
          `Missing type for previously undeclared variable ${symbol}`
        );
      this.add(
        symbol,
        new XBar(
          new Map<string, unknown>([["value", value]]),
          LexRoot.ValueObject(type),
          symbol
        )
      );
    }
  }

  has(symbol: string): boolean {
    symbol = symbol.toLowerCase();
    return this._entries.has(symbol) || this.parent.has(symbol);
  }

  lookup(symbol: string): XBar {
    symbol = symbol.toLowerCase();
    if (this._entries.has(symbol)) return this._entries.get(symbol)!;
    return this.parent.lookup(symbol);
  }

  add(symbol: string, value: XBar): void {
    symbol = symbol.toLowerCase();
    this._entries.set(symbol, value);
  }
}
