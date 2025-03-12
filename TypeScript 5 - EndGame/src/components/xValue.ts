export { Value, LitValue, LexValue, MergeValue };

interface SymbolTable {
  lookup(symbol: string): any;
}
interface Value<T> {
  calculateValue(lookupTable: SymbolTable): void;
  getValue(): () => T;
}

class LitValue<T> implements Value<T> {
  private value: () => T;

  constructor(val: T) {
    this.value = () => val;
  }

  calculateValue(lookupTable: SymbolTable) {}

  getValue(): () => T {
    return this.value;
  }
}

class LexValue<T> implements Value<T> {
  private symbol: string;
  private value?: () => T;
  private restOfSentence = new Array<Value<any>>();

  constructor(symbol: string) {
    this.symbol = symbol;
  }

  getSymbol(): string {
    return this.symbol;
  }

  setRest(rest: Value<any>[]) {
    this.restOfSentence = rest;
  }

  calculateValue(lookupTable: SymbolTable) {
    this.value = lookupTable.lookup(this.symbol);
  }

  getValue(): () => T {
    if (this.value == undefined)
      throw new Error(
        `Word with symbol: ${this.symbol} has not been looked up yet.`
      );
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

  constructor(mode: MergeMode, fx: Value<T>, arg?: any);
  constructor(mode: MergeMode, fx: Value<(input: S) => T>, arg: Value<S>);
  constructor(mode: MergeMode, arg: Value<S>, fx: Value<(input: S) => T>) {
    switch (mode) {
      case MergeMode.Composing:
        this.fx = fx;
        this.arg = arg;
        break;
      case MergeMode.NonBranching:
        this.fx = fx;
        break;
      case MergeMode.Union:
        throw new Error("Union merge not implemented.");
        break;
    }
    this.composeMode = mode;
  }

  calculateValue(lookupTable: SymbolTable): void {
    switch (this.composeMode) {
      case MergeMode.NonBranching:
        let daughterValue = this.fx.getValue();
        this.value = daughterValue as () => T;
        break;
      case MergeMode.Composing:
        if (this.arg == undefined)
          throw new Error("Argument not defined for composing merge mode.");
        let fxValue = this.fx.getValue() as () => (input: S) => T;
        let argValue = this.arg.getValue();
        this.value = () => fxValue()(argValue());
        break;
    }
  }
  getValue(): () => T {
    if (this.value == undefined)
      throw new Error(`This node has not been merged.`);
    return this.value;
  }
}
