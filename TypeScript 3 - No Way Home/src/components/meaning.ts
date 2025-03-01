import { Parser, Token } from "typescript-parsec";
import { Argument, MeaningInterface, TokenKind } from "../header";

class Meaning<T> implements MeaningInterface<T> {
  getMeaning(): T {
    throw new Error("Meaning.getMeaning() not implemented yet.");
  }
  giveArgument(arg: Argument, value: MeaningInterface<any>): boolean {
    throw new Error("Meaning.giveArgument() not implemented yet.");
  }
  nextArgument(): Parser<Token<TokenKind>, MeaningInterface<any>> {
    throw new Error("Meaning.nextArgument() not implemented yet.");
  }
}
