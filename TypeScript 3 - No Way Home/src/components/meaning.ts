import { Parser, Token } from "typescript-parsec";
import {
  Argument,
  MeaningInterface,
  StateInterface,
  TokenKind,
  TreeNodeInterface,
} from "../header";

export { Meaning };

class Meaning<T> implements MeaningInterface<T> {
  private node: TreeNodeInterface;
  private meaningFunction?: (state: StateInterface) => T;

  constructor(node: TreeNodeInterface) {
    this.node = node;
  }

  assignMeaning(f: (state: StateInterface) => T): void {
    this.meaningFunction = f;
  }

  getNode(): TreeNodeInterface {
    return this.node;
  }

  evaluate(state: StateInterface): T {
    if (this.meaningFunction == undefined)
      throw new Error("No meaning function defined for this node.");
    return (this.meaningFunction as (state: StateInterface) => T)(state);
  }
  giveArgument(arg: Argument, value: MeaningInterface<any>): boolean {
    throw new Error("Meaning.giveArgument() not implemented yet.");
  }
  nextArgument(): Parser<Token<TokenKind>, MeaningInterface<any>> {
    throw new Error("Meaning.nextArgument() not implemented yet.");
  }
}
