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
import { LexValue, LitValue, MergeMode, MergeValue, Value } from "./xValue";
import {
  Argument,
  TokenKind,
  VariableMeaning,
  XBarInterface,
  lexer,
  parserRules,
} from "../header";
import { SymbolTable, testTable } from "./lexicon";

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

  acceptArgument(argType: Argument, symbol: string = "") {
    if (this.lookup == undefined) throw new Error("No lookup table defined.");
    // Get frame for argumentType
    const frame = frames.get(argType)!(this.lookup);
    // Parse frame for new merged value
    let arg: Value<any>;
    arg = new LitValue(
      expectSingleResult(
        expectEOF(frame.parse(lexer.parse(this.root.getRest())))
      )
    );
    arg.attachTable(this.lookup);
    const mergedArg = new MergeValue(MergeMode.Composing, arg, this.root);
    mergedArg.attachTable(this.lookup);
    // Return new parent XBar
    const newVBar = new XBar(mergedArg, this.lookup, "VBar");
    newVBar.childPhrase = this;
    newVBar.adjunct = new XBar(arg, this.lookup, "Theme");
    return newVBar;
  }

  run() {
    this.root.getValue()();
  }

  toString(indent = 1): string {
    return `{${this.root.getSymbol()}}`;
    // return `${this.label}: ${this.root.getSymbol()}${this.childPhrase == null ? "" : ":\n" + "-".repeat(indent) + this.childPhrase.toString(indent + 1)}${this.adjunct == null ? "" : " + " + this.adjunct.toString()}`;
  }
}

function createFrame(
  pattern: Parser<TokenKind, Value<any>>
): (lookup: SymbolTable<VariableMeaning>) => Parser<TokenKind, Value<any>> {
  return (lookup: SymbolTable<VariableMeaning>) =>
    apply(
      seq(pattern, parserRules.REST),
      ([newArg, rest]: [Value<any>, string]) => {
        newArg.attachTable(lookup);
        // console.log(`Theme grabbed: ${newArg.getValue()}`);
        if (rest.startsWith(" ")) rest = rest.slice(1);
        newArg.setRest(rest);
        return newArg;
      }
    );
}

const frames = new Map<
  Argument,
  (lookup: SymbolTable<VariableMeaning>) => Parser<TokenKind, any>
>([
  [Argument.Theme, createFrame(alt_sc(parserRules.LITERAL, parserRules.WORD))],
  [Argument.Destination, createFrame(kright(str("as"), parserRules.WORD))],
]);
