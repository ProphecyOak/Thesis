import { SymbolTableInterface, VariableMeaning } from "../header";

export { LitValue, LexValue, MergeValue, MergeMode };
export type { Value };

interface Value<T> {
  attachTable(lookupTable: SymbolTableInterface<VariableMeaning>): void;
  valueType(): string;
  getValue(): () => T;
  getSymbol(): string;
  setRest(rest: string): void;
  getRest(): string;
}

class LitValue<T> implements Value<T> {
  private value: () => T;
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

  attachTable() {}

  getValue(): () => T {
    return this.value;
  }

  setRest(rest: string): LitValue<T> {
    this.restOfPhrase = rest;
    return this;
  }
  getRest(): string {
    return this.restOfPhrase;
  }
}

class LexValue<T> implements Value<T> {
  private symbol: string;
  private value?: () => T;
  private restOfPhrase = "";
  private table?: SymbolTableInterface<VariableMeaning>;

  constructor(symbol: string) {
    this.symbol = symbol;
  }

  valueType(): string {
    return "LexValue";
  }

  getSymbol(): string {
    return this.symbol;
  }

  setRest(rest: string) {
    this.restOfPhrase = rest;
  }

  getRest(): string {
    return this.restOfPhrase;
  }

  attachTable(lookupTable: SymbolTableInterface<VariableMeaning>) {
    this.table = lookupTable;
  }

  getValue(): () => T {
    if (this.table == undefined)
      throw new Error(`No lookup table attached for {${this.getSymbol()}}`);
    if (!this.table.has(this.symbol))
      throw new Error(`No entry in lookup for {${this.symbol}}`);
    try {
      this.value = this.table.lookup(this.symbol)(this) as () => T;
    } catch (e) {
      throw new Error(
        `{${this.symbol}}: {${this.table.lookup(this.symbol)}}, ${e}`
      );
    }
    return this.value;
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
  private children = new Array<Value<unknown>>();
  private table?: SymbolTableInterface<VariableMeaning>;
  private restOfPhrase = "";

  constructor(mode: MergeMode, fx: Value<T>, arg?: unknown);
  constructor(mode: MergeMode, fx: Value<(input: S) => T>, arg: Value<S>);
  constructor(mode: MergeMode, arg: Value<S>, fx: Value<(input: S) => T>) {
    switch (mode) {
      case MergeMode.Composing:
        this.arg = arg;
        this.children.push(this.arg);
        this.fx = fx;
        this.children.push(this.fx);
        break;
      case MergeMode.NonBranching: {
        this.fx = fx;
        this.children.push(this.fx);
        break;
      }
      case MergeMode.Union:
        throw new Error("Union merge not implemented.");
    }
    const argRestLength = this.arg?.getRest().length;
    this.restOfPhrase = this.fx
      .getRest()
      .slice(argRestLength == undefined ? 0 : argRestLength);
    this.composeMode = mode;
  }

  valueType(): string {
    return "MergeValue";
  }

  getSymbol(): string {
    return `${this.fx.getSymbol()}(${this.arg?.getSymbol()})`;
  }

  attachTable(lookupTable: SymbolTableInterface<VariableMeaning>): void {
    this.table = lookupTable;
    if (this.fx != undefined) this.fx.attachTable(lookupTable);
    if (this.arg != undefined) this.arg.attachTable(lookupTable);
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
        try {
          this.value = () =>
            (this.fx.getValue()() as (input: S) => T)(this.arg!.getValue()());
        } catch (e: unknown) {
          throw new Error(`Failed to get merged value: ${e}`);
        }
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
