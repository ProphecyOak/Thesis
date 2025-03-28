import { Token } from "typescript-parsec";
import { SymbolTable } from "./lexicon";

export { Value, LitValue, LexValue, MergeValue, MergeMode };

interface Value<T> {
  attachTable(lookupTable: SymbolTable<any>): void;
  valueType(): string;
  getValue(): () => T;
  getSymbol(): string;
  setParent(parent: MergeValue<any, any>): void;
  setRest(rest: string): void;
  getRest(): string;
}

class LitValue<T> implements Value<T> {
  private value: () => T;
  private parent?: MergeValue<any, any>;
  private symbol?: string;
  private restOfPhrase: string = "";

  constructor(val: () => T, symbol?: string) {
    this.value = val;
    this.symbol = symbol;
  }

  valueType(): string {
    return "LitValue";
  }

  getSymbol(): string {
    if (this.symbol != undefined) return this.symbol;
    return "Undefined Literal Symbol";
  }

  setParent(parent: MergeValue<any, any>) {
    this.parent = parent;
  }

  attachTable(lookupTable: SymbolTable<any>) {}

  getValue(): () => T {
    return this.value;
  }

  setRest(rest: string): LitValue<T> {
    this.restOfPhrase = rest;
    return this;
  }
  getRest(): string {
    return "";
  }
}

class LexValue<T> implements Value<T> {
  private symbol: string;
  private value?: () => T;
  private restOfPhrase = "";
  private parent?: MergeValue<any, any>;
  private table?: SymbolTable<any>;

  constructor(symbol: string) {
    this.symbol = symbol;
  }

  valueType(): string {
    return "LexValue";
  }

  getSymbol(): string {
    return this.symbol;
  }

  setParent(parent: MergeValue<any, any>) {
    this.parent = parent;
  }

  setRest(rest: string) {
    this.restOfPhrase = rest;
  }

  getRest(): string {
    return this.restOfPhrase;
  }

  attachTable(lookupTable: SymbolTable<any>) {
    this.table = lookupTable;
  }

  getValue(): () => T {
    if (this.table == undefined)
      throw new Error(`No lookup table attached for {${this.getSymbol()}}`);
    if (!this.table.words.has(this.symbol))
      throw new Error(`No entry in lookup for ${this.symbol}`);
    this.value = this.table.lookup(this.symbol)(this);
    return this.value as () => T;
  }
}

enum MergeMode {
  NonBranching,
  Composing,
  Union,
}

class MergeValue<T, S> implements Value<T> {
  private value?: () => T;
  private fx: Value<T> | Value<(input: S) => T>;
  private arg?: Value<S>;
  private composeMode: MergeMode;
  private parent?: MergeValue<any, any>;
  private children = new Array<Value<any>>();
  private table?: SymbolTable<any>;
  private restOfPhrase = "";

  constructor(mode: MergeMode, fx: Value<T>, arg?: any);
  constructor(mode: MergeMode, fx: Value<(input: S) => T>, arg: Value<S>);
  constructor(mode: MergeMode, arg: Value<S>, fx: Value<(input: S) => T>) {
    switch (mode) {
      case MergeMode.Composing:
        this.arg = arg;
        this.arg.setParent(this);
        this.children.push(this.arg);
      case MergeMode.NonBranching:
        this.fx = fx;
        this.fx.setParent(this);
        this.children.push(this.fx);
        const argRestLength = this.arg?.getRest().length;
        this.restOfPhrase = this.fx
          .getRest()
          .slice(argRestLength == undefined ? 0 : argRestLength);
        break;
      case MergeMode.Union:
        throw new Error("Union merge not implemented.");
    }
    this.composeMode = mode;
  }

  valueType(): string {
    return "MergeValue";
  }

  getSymbol(): string {
    return `${this.fx.getSymbol()}(${this.arg?.getSymbol()})`;
  }

  setParent(parent: MergeValue<any, any>) {
    this.parent = parent;
  }

  attachTable(lookupTable: SymbolTable<any>): void {
    this.table = lookupTable;
  }
  getValue(): () => T {
    if (this.table == undefined)
      throw new Error(`No lookup table attached for ${this.getSymbol()}`);
    switch (this.composeMode) {
      case MergeMode.NonBranching:
        this.value = this.fx.getValue as () => T;
        break;
      case MergeMode.Composing:
        if (this.arg == undefined)
          throw new Error("Argument not defined for composing merge mode.");
        this.value = () =>
          (this.fx.getValue()() as (input: S) => T)(this.arg!.getValue()());
        break;
    }
    return this.value as () => T;
  }

  setRest(rest: string) {
    this.restOfPhrase = rest;
  }
  getRest(): string {
    return this.restOfPhrase;
  }
}
