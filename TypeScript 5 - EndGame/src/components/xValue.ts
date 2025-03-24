import { Token } from "typescript-parsec";

export { Value, LitValue, LexValue, MergeValue, SymbolTable, MergeMode };

interface SymbolTable<T> {
  words: Map<string, T>;
  lookup(symbol: string): T;
}
interface Value<T> {
  attachTable(lookupTable: SymbolTable<any>): void;
  getValue(): () => T;
  getSymbol(): string;
  setParent(parent: MergeValue<any, any>): void;
}

class LitValue<T> implements Value<T> {
  private value: T;
  private parent?: MergeValue<any, any>;

  constructor(val: T) {
    this.value = val;
  }
  getSymbol(): string {
    if (typeof this.value == "string" || typeof this.value == "number")
      return this.value.toString();
    return "Complicated Type";
  }

  setParent(parent: MergeValue<any, any>) {
    this.parent = parent;
  }

  attachTable(lookupTable: SymbolTable<any>) {}

  getValue(): () => T {
    return () => this.value;
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
      throw new Error(`No lookup table attached for ${this.getSymbol()}`);
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
        break;
      case MergeMode.Union:
        throw new Error("Union merge not implemented.");
        break;
    }
    this.composeMode = mode;
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
}
