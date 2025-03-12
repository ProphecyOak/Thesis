export { Value, LitValue, LexValue, MergeValue };

interface SymbolTable {
  lookup(symbol: string): any;
}
interface Value<T> {
  calculateValue(lookupTable: SymbolTable): void;
  getValue(): () => T;
  getSymbol(): string;
  setParent(parent: MergeValue<any, any>): void;
}

class LitValue<T extends string | number> implements Value<T> {
  private value: () => T;
  private parent?: MergeValue<any, any>;

  constructor(val: T) {
    this.value = () => val;
  }
  getSymbol(): string {
    return this.value().toString();
  }

  setParent(parent: MergeValue<any, any>) {
    this.parent = parent;
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
  private parent?: MergeValue<any, any>;

  constructor(symbol: string) {
    this.symbol = symbol;
  }

  getSymbol(): string {
    return this.symbol;
  }

  setParent(parent: MergeValue<any, any>) {
    this.parent = parent;
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
  private parent?: MergeValue<any, any>;
  private children = new Array<Value<any>>();

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
