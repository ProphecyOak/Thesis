/* eslint-disable @typescript-eslint/no-unused-vars */

import { getPrintableTree } from "../tools/tree_printer";

enum LexPrimitive {
  Void = "Void",
  String = "String",
  Number = "Number",
  Boolean = "Boolean",
  Lexicon = "Lexicon",
  Stringable = "Stringable",
}

export interface LexType {
  equals(other: LexType): boolean;
  takes(other: LexType): boolean;
  toString(): string;
  readonly typeKind: string;
}

export class CompoundLexType implements LexType {
  typeKind = "CompoundLexType";
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
  typeKind = "SimpleLexType";
  type: LexPrimitive;
  constructor(type: LexPrimitive) {
    this.type = type;
  }
  equals(other: LexType): boolean {
    if (!(other instanceof SimpleLexType)) return false;
    if (this.type == LexPrimitive.Stringable)
      return [
        LexPrimitive.Boolean,
        LexPrimitive.Number,
        LexPrimitive.String,
        LexPrimitive.Stringable,
      ].includes(other.type); // || other instanceof ObjectLexType

    return other.type == this.type;
  }
  takes(): boolean {
    return false;
  }
  toString(): string {
    return this.type.toString();
  }
}

export class ObjectLexType implements LexType {
  typeKind = "ObjectLexType";
  types = new Map<string, LexType>();
  constructor(valueType: LexType) {
    this.types.set("value", valueType);
  }

  equals(other: LexType): boolean {
    return other instanceof ObjectLexType;
  }
  takes(): boolean {
    return false;
  }
  toString(): string {
    return `{${Array.from(this.types.entries())
      .map(
        ([field, value]: [string, LexType]) => `${field}: ${value.toString()}`
      )
      .join(", ")}}`;
  }
}

export const LexRoot = {
  Void: new SimpleLexType(LexPrimitive.Void),
  String: new SimpleLexType(LexPrimitive.String),
  Number: new SimpleLexType(LexPrimitive.Number),
  Boolean: new SimpleLexType(LexPrimitive.Boolean),
  Lexicon: new SimpleLexType(LexPrimitive.Lexicon),
  Stringable: new SimpleLexType(LexPrimitive.Stringable),
  ValueObject: (valueType: LexType) => new ObjectLexType(valueType),
};

export class XBar {
  // Contains the value of this XBar.
  readonly value: unknown;
  // Type of this XBar's value.
  readonly type: LexType;
  // Text represented by this XBar.
  readonly symbol: string;

  // Child XBars
  children?: XBar[];

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
        `XBars of types ${first.typeString()} and ${second.typeString()} cannot compose:\n` +
          `Tree 1:\n${getPrintableTree(first, XBar.toTree)}\n` +
          `Tree 2:\n${getPrintableTree(second, XBar.toTree)}\n`
      );
    const fx = thisIsFX ? first : second;
    const arg = thisIsFX ? second : first;
    if (!(fx.type instanceof CompoundLexType))
      throw new Error(`Type ${fx.type.toString()} cannot be a function.`);
    const newXBar = new XBar(
      (fx.value as (arg: unknown) => unknown)(arg.value),
      fx.type.output,
      `${first.symbol} ${second.symbol}`
    );
    newXBar.children = [first, second];
    return newXBar;
  }
  static toTree(xbar: XBar): { label: string; children: XBar[] } {
    return {
      label:
        (xbar.symbol != "" ? xbar.symbol : "missing") +
        ` - ${xbar.typeString()}`,
      children: xbar.children == undefined ? [] : xbar.children,
    };
  }
}

interface ILex {
  lookup(symbol: string): XBar;
  add(symbol: string, value: XBar): void;
  has(symbol: string): boolean;
}

const emptyLex: ILex = {
  lookup(symbol: string): XBar {
    throw new Error(`Symbol '${symbol}' is undefined in this scope.`);
  },
  add(_symbol: string, _value: XBar): void {
    throw new Error(`Symbol cannot be added to a null parent.`);
  },
  has: function (): boolean {
    return false;
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
  has(symbol: string): boolean {
    symbol = symbol.toLowerCase();
    return this.entries.has(symbol) || this.parent.has(symbol);
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
