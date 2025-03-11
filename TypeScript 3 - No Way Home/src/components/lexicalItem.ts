import {
  Argument,
  LexicalCategory,
  LexicalItemInterface,
  MeaningInterface,
  StateInterface,
  TreeNodeInterface,
} from "../header";
import { Meaning } from "./meaning";
import { State } from "./state";

export { LexicalItem };

class LexicalItem implements LexicalItemInterface {
  private symbol: string;
  private cat: LexicalCategory;
  private args = new Array<Argument>();
  func?: (wordInstance: TreeNodeInterface) => (state: StateInterface) => any;

  constructor(symbol: string, cat: LexicalCategory) {
    this.symbol = symbol;
    this.cat = cat;
  }

  getSymbol(): string {
    return this.symbol;
  }

  getCategory(): LexicalCategory {
    return this.cat;
  }

  setMeaning(
    f: (wordInstance: TreeNodeInterface) => (state: StateInterface) => any
  ): LexicalItemInterface {
    this.func = f;
    return this;
  }

  getMeaning(node: TreeNodeInterface): (state: StateInterface) => any {
    if (this.func == undefined)
      throw new Error(`No meaning defined for ${this.symbol}`);
    return this.func(node);
  }

  requireArgument(arg: Argument): LexicalItemInterface {
    this.args.push(arg);
    return this;
  }

  getLocal(node: TreeNodeInterface): MeaningInterface<any> {
    let newMeaning = new Meaning(
      node,
      this.args.map((x: Argument) => x)
    );
    return newMeaning;
  }
}
