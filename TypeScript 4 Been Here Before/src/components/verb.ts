import { nil, Parser } from "typescript-parsec";
import {
  Argument,
  ArgumentValue,
  BlockInterface,
  TokenKind,
  VerbInterface,
  SemVar,
} from "../header";

export { Verb };

class Verb implements VerbInterface {
  symbol: string;
  argumentValues: Partial<Record<Argument, ArgumentValue>> = {};
  requiredArgs: Argument[] = new Array<Argument>();

  parentBlock?: BlockInterface;

  constructor(symbol: string) {
    this.symbol = symbol;
  }

  getResult() {
    if (
      this.requiredArgs.some(
        (arg: Argument) => this.argumentValues[arg] == null
      )
    )
      throw new Error(
        `Verb ${this.symbol} is missing arguments: ${this.getMissingArguments().join(
          ", "
        )}`
      );
    let foundWord = this.getBlock().lookupSymbol(this.symbol);
    if (!(foundWord instanceof Function))
      throw new Error(`${this.symbol} is not a verb!`);
    return foundWord(this)(this.argumentValues);
  }

  getMissingArguments(): Argument[] {
    return Object.keys(this.argumentValues)
      .filter(
        (arg: string) =>
          this.argumentValues[arg as keyof typeof Argument] == null
      )
      .map((value: string) => value as Argument);
  }

  setBlock(block: BlockInterface): void {
    this.parentBlock = block;
  }

  getBlock(): BlockInterface {
    if (this.parentBlock == undefined)
      throw new Error("Sentence is not assigned to a block.");
    return this.parentBlock;
  }

  acceptArguments(): Parser<TokenKind, any> {
    return nil();
  }
}
