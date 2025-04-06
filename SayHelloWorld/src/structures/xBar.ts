enum LexRoot {
  Void = "Void",
  String = "String",
  Number = "Number",
  Boolean = "Boolean",
  Lexicon = "Lexicon",
}

export class XBar {
  // Contains the value of this XBar.
  value: unknown;
  // Type of this XBar's value.
  inputType: LexRoot[];
  outputType: LexRoot;

  constructor(value: unknown, inputType: LexRoot[], outputType: LexRoot) {
    this.value = value;
    this.inputType = inputType;
    this.outputType = outputType;
  }

  // If the type of this XBar's value is (lex: ILexicon)=>void, then runs it.
  run(lexicon: Lexicon): void {
    if (this.inputType[0] != LexRoot.Lexicon || this.inputType.length > 1)
      throw new Error(`This XBar is waiting for types: ${this.inputType}`);
    (this.value as (lexicon: Lexicon) => void)(lexicon);
  }
  // Returns a new parent node that has this node and the sister node as children.
  attachSister(sister: XBar): XBar {
    const thisIsFX = this.inputType[0] == sister.outputType;
    if (!thisIsFX && sister.inputType[0] != this.outputType)
      throw new Error(
        `XBars of types ${this.typeString()} and ${sister.typeString()} cannot compose.`
      );
    const fx = thisIsFX ? this : sister;
    const arg = thisIsFX ? sister : this;
    return new XBar(
      (fx.value as (arg: unknown) => unknown)(arg.value),
      fx.inputType.slice(1),
      fx.outputType
    );
  }
  typeString(): string {
    const numArgs = this.inputType.length;
    return `${this.inputType.reduceRight((acc: string, e: LexRoot) => {
      return `<${e},${acc}`;
    }, "")}, ${this.outputType}${">".repeat(numArgs)}`;
  }

  static createParent(fx: XBar, arg: XBar): XBar {
    throw new Error("Method not implemented.");
  }
}

export class Lexicon {
  lookup(symbol: string): unknown {}
  add(symbol: string, value: unknown): void {}
}
