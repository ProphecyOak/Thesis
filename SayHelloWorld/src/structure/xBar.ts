/* eslint-disable @typescript-eslint/no-unused-vars */

enum LexPrimitive {
  Void = "Void",
  String = "String",
  Number = "Number",
  Boolean = "Boolean",
  Lexicon = "Lexicon",
  Stringable = "Stringable",
}

interface LexType {
  equals(other: LexType): boolean;
  takes(other: LexType): boolean;
  toString(): string;
}

export class CompoundLexType implements LexType {
  input: LexType;
  output: LexType;

  constructor(input: LexType, output: LexType) {
    this.input = input;
    this.output = output;
  }
  equals(other: LexType): boolean {
    return (
      other instanceof CompoundLexType &&
      this.input.equals(other.input) &&
      this.output.equals(other.output)
    );
  }
  takes(other: LexType): boolean {
    return this.input.equals(other);
  }
  toString(): string {
    return `<${this.input.toString()}, ${this.output.toString()}>`;
  }
}
class SimpleLexType implements LexType {
  type: LexPrimitive;
  constructor(type: LexPrimitive) {
    this.type = type;
  }
  equals(other: LexType): boolean {
    if (!(other instanceof SimpleLexType)) return false;
    if (this.type == LexPrimitive.Stringable) {
      return [
        LexPrimitive.Boolean,
        LexPrimitive.Number,
        LexPrimitive.String,
      ].includes(other.type);
    }
    return other.type == this.type;
  }
  takes(): boolean {
    return false;
  }
  toString(): string {
    return this.type.toString(); // MAYBE FIX THIS TO BETTER REPRESENT THE SETS
  }
}

export const LexRoot = {
  Void: new SimpleLexType(LexPrimitive.Void),
  String: new SimpleLexType(LexPrimitive.String),
  Number: new SimpleLexType(LexPrimitive.Number),
  Boolean: new SimpleLexType(LexPrimitive.Boolean),
  Lexicon: new SimpleLexType(LexPrimitive.Lexicon),
  Stringable: new SimpleLexType(LexPrimitive.Stringable),
};

export class XBar {
  // Contains the value of this XBar.
  readonly value: unknown;
  // Type of this XBar's value.
  readonly type: LexType;
  // Text represented by this XBar.
  readonly symbol: string;

  constructor(value: unknown, type: LexType, symbol?: string) {
    this.value = value;
    this.type = type;
    this.symbol = symbol ? symbol : "";
  }

  // If the type of this XBar's value is (lex: ILexicon)=>void, then runs it.
  run(lexicon: Lexicon): void {
    if (!this.type.equals(new CompoundLexType(LexRoot.Lexicon, LexRoot.Void)))
      throw new Error(`This XBar is of type: ${this.type.toString()}`);
    (this.value as (lexicon: Lexicon) => void)(lexicon);
  }
  // Returns a string representation of the XBar's value's type signature.
  typeString(): string {
    return this.type.toString();
  }

  // Creates a new XBar with first and second as it's children.
  static createParent(first: XBar, second: XBar): XBar {
    const thisIsFX = first.type.takes(second.type);
    if (!thisIsFX && !second.type.takes(first.type))
      throw new Error(
        `XBars of types ${first.typeString()} and ${second.typeString()} cannot compose.`
      );
    const fx = thisIsFX ? first : second;
    const arg = thisIsFX ? second : first;
    if (!(fx.type instanceof CompoundLexType))
      throw new Error(`Type ${fx.type.toString()} cannot be a function.`);
    return new XBar(
      (fx.value as (arg: unknown) => unknown)(arg.value),
      fx.type.output,
      `${first.symbol} ${second.symbol}`
    );
  }
}

interface ILex {
  lookup(symbol: string): XBar;
  add(symbol: string, value: XBar): void;
}

const emptyLex: ILex = {
  lookup(symbol: string): XBar {
    throw new Error(`Symbol ${symbol} is undefined in this scope.`);
  },
  add(_symbol: string, _value: XBar): void {
    throw new Error(`Symbol cannot be added to a null parent.`);
  },
};

export class Lexicon implements ILex {
  private _parent?: ILex;
  private entries = new Map<string, XBar>();

  get parent() {
    if (this._parent == undefined) return emptyLex;
    return this._parent;
  }

  constructor(parent?: ILex) {
    this._parent = parent;
  }
  lookup(symbol: string): XBar {
    symbol = symbol.toLowerCase();
    if (this.entries.has(symbol)) return this.entries.get(symbol)!;
    return this.parent.lookup(symbol);
  }
  add(symbol: string, value: XBar): void {
    symbol = symbol.toLowerCase();
    this.entries.set(symbol, value);
  }
}
