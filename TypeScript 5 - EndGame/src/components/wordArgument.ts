import {
  alt_sc,
  apply,
  expectEOF,
  expectSingleResult,
  kright,
  Parser,
  seq,
  str,
} from "typescript-parsec";
import { LitValue, MergeMode, MergeValue, Value } from "./xValue";
import {
  Argument,
  TokenKind,
  VariableMeaning,
  XBarInterface,
  lexer,
  parserRules,
} from "../header";
import { SymbolTable } from "./lexicon";

export { XBar };

class XBar implements XBarInterface {
  root: Value<any>;
  lookup?: SymbolTable<VariableMeaning>;
  childPhrase: XBar | null = null;
  adjunct: XBar | null = null;
  label: string = "XBar";

  constructor(
    vBar: Value<any>,
    lookup?: SymbolTable<VariableMeaning>,
    label?: string
  ) {
    this.root = vBar;
    if (lookup != undefined) this.assignLookup(lookup);
    if (label != undefined) this.label = label;
  }

  assignLookup(lookup: SymbolTable<VariableMeaning>): XBar {
    this.lookup = lookup;
    this.root.attachTable(this.lookup);
    return this;
  }

  acceptArgument(argType: Argument) {
    if (this.lookup == undefined) throw new Error("No lookup table defined.");
    // Get frame for argumentType
    const frame = frames.get(argType)!(this.lookup);
    // Parse frame for new merged value

    const currentRest: string =
      this.adjunct != undefined
        ? this.adjunct?.root.getRest()
        : this.childPhrase != undefined
          ? this.childPhrase?.root.getRest()
          : this.root.getRest();

    let arg: Value<any>;
    arg = expectSingleResult(expectEOF(frame.parse(lexer.parse(currentRest))));
    arg.attachTable(this.lookup);
    const mergedArg = new MergeValue(MergeMode.Composing, arg, this.root);
    mergedArg.attachTable(this.lookup);
    // Return new parent XBar
    const newVBar = new XBar(mergedArg, this.lookup, "VBar");
    newVBar.childPhrase = this;
    newVBar.adjunct = new XBar(arg, this.lookup, argType.toString());
    return newVBar;
  }

  run() {
    this.root.getValue()();
  }

  toString(indent = 1): string {
    return `{${this.root.getSymbol()}}`;
  }
}

function createFrame(
  pattern: Parser<TokenKind, Value<any>>,
  fx?: (val: Value<any>, rest: string) => Value<any>
): (lookup: SymbolTable<VariableMeaning>) => Parser<TokenKind, Value<any>> {
  return (lookup: SymbolTable<VariableMeaning>) =>
    apply(
      seq(pattern, parserRules.REST),
      ([newArg, rest]: [Value<any>, string]) => {
        newArg.attachTable(lookup);
        if (rest.startsWith(" ")) rest = rest.slice(1);
        newArg.setRest(rest);
        return newArg;
      }
    );
}

const frames = new Map<
  Argument,
  (lookup: SymbolTable<VariableMeaning>) => Parser<TokenKind, Value<any>>
>([
  [Argument.Theme, createFrame(alt_sc(parserRules.LITERAL, parserRules.WORD))],
  [
    Argument.Destination,
    createFrame(
      apply(
        kright(str("as"), parserRules.WORD),
        (val: Value<any>) => new LitValue(() => val.getSymbol())
      )
    ),
  ],
]);
