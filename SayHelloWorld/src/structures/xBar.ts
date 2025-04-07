/* eslint-disable @typescript-eslint/no-unused-vars */
export enum LexRoot {
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
  typeString(): string {
    const numArgs = this.inputType.length;
    return this.inputType.reduceRight(
      (acc: string, e: LexRoot) => `<${e}, ${acc}`,
      `${this.outputType}${">".repeat(numArgs)}`
    );
  }

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
      fx.outputType
    );
  }
}

export class Lexicon {
  lookup(_symbol: string): unknown {
    throw new Error("Method not implemented.");
  }
  add(_symbol: string, _value: unknown): void {
    throw new Error("Method not implemented.");
  }
}
