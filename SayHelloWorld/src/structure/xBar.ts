/* eslint-disable @typescript-eslint/no-unused-vars */
export enum LexRoot {
  Void = "Void",
  String = "String",
  Number = "Number",
  Boolean = "Boolean",
  Lexicon = "Lexicon",
}

interface Nested<T> {
  input: (T | Nested<T>)[];
  output: T | Nested<T>;
}

export class XBar {
  // Contains the value of this XBar.
  readonly value: unknown;
  // Type of this XBar's value.
  readonly inputType: LexRoot[];
  readonly outputType: LexRoot;
  // Text represented by this XBar.
  readonly symbol: string;

  constructor(
    value: unknown,
    inputType: LexRoot[],
    outputType: LexRoot,
    symbol?: string
  ) {
    this.value = value;
    this.inputType = inputType;
    this.outputType = outputType;
    this.symbol = symbol ? symbol : "";
  }

  // If the type of this XBar's value is (lex: ILexicon)=>void, then runs it.
  run(lexicon: Lexicon): void {
    if (this.inputType[0] != LexRoot.Lexicon || this.inputType.length > 1)
      throw new Error(`This XBar is waiting for types: ${this.inputType}`);
    (this.value as (lexicon: Lexicon) => void)(lexicon);
  }
  // Returns a string representation of the XBar's value's type signature.
  typeString(): string {
    const numArgs = this.inputType.length;
    return this.inputType.reduceRight(
      (acc: string, e: LexRoot) => `<${e}, ${acc}`,
      `${this.outputType}${">".repeat(numArgs)}`
    );
  }

  // Creates a new XBar with first and second as it's children.
  static createParent(first: XBar, second: XBar): XBar {
    const thisIsFX = first.inputType[0] == second.outputType;
    if (!thisIsFX && second.inputType[0] != first.outputType)
      throw new Error(
        `XBars of types ${first.typeString()} and ${second.typeString()} cannot compose.`
      );
    const fx = thisIsFX ? first : second;
    const arg = thisIsFX ? second : first;
    if (arg.inputType.length != 1 || arg.inputType[0] != LexRoot.Lexicon)
      throw new Error(
        `XBar of type ${arg.typeString()} might be a little too complex to be accepted by ${first.typeString()}.`
      );
    return new XBar(
      (fx.value as (arg: unknown) => unknown)(arg.value),
      fx.inputType.slice(1),
      fx.outputType,
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
