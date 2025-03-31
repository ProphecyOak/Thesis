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
  XBarInterface,
  lexer,
  parserRules,
} from "../header";
import { SymbolTable } from "./lexicon";

export { XBar };

class XBar implements XBarInterface {
  root: Value<any>;
  lookup?: SymbolTable;
  childPhrase: XBar | null = null;
  adjunct: XBar | null = null;
  label: string = "XBar";

  constructor(vBar: Value<any>, lookup?: SymbolTable, label?: string) {
    this.root = vBar;
    if (lookup != undefined) this.assignLookup(lookup);
    if (label != undefined) this.label = label;
  }

  assignLookup(lookup: SymbolTable): XBar {
    this.lookup = lookup;
    this.root.attachTable(this.lookup);
    return this;
  }

  acceptArgument(argType: Argument): XBar {
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
    try {
      arg = expectSingleResult(
        expectEOF(frame.parse(lexer.parse(currentRest)))
      );
    } catch (e) {
      throw new Error(
        `Failed to accept ${Argument[argType]} from {${currentRest}}: {${e}}`
      );
    }
    arg.attachTable(this.lookup);
    const mergedArg = new MergeValue(MergeMode.Composing, arg, this.root);
    mergedArg.attachTable(this.lookup);
    // Return new parent XBar
    const newVBar = new XBar(mergedArg, this.lookup, "VBar");
    newVBar.childPhrase = this;
    newVBar.adjunct = new XBar(arg, this.lookup, argType.toString());
    return newVBar;
  }

  optionalArgument(argType: Argument): XBar {
    try {
      return this.acceptArgument(argType);
    } catch (e) {
      return this;
    }
  }

  run() {
    this.root.getValue()();
  }

  toString(indent = 1): string {
    return `{${this.root.getSymbol()}}`;
  }
}

function createFrame(
  pattern: (lookup: SymbolTable) => Parser<TokenKind, Value<any>>
): (lookup: SymbolTable) => Parser<TokenKind, Value<any>> {
  return (lookup: SymbolTable) =>
    apply(
      seq(pattern(lookup), parserRules.REST),
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
  (lookup: SymbolTable) => Parser<TokenKind, Value<any>>
>([
  [
    Argument.Theme,
    createFrame((lookup: SymbolTable) =>
      alt_sc(parserRules.LITERAL, parserRules.WORD)
    ),
  ],
  [
    Argument.Destination,
    createFrame((lookup: SymbolTable) =>
      apply(
        kright(str("as"), parserRules.WORD),
        (val: Value<any>) => new LitValue(() => val.getSymbol())
      )
    ),
  ],
  [
    Argument.Iterator,
    createFrame((lookup: SymbolTable) =>
      apply(
        kright(str("each"), parserRules.WORD),
        (iterator: LexValue<any>) => new LitValue(() => iterator.getSymbol())
      )
    ),
  ],
  [
    Argument.Iterable,
    createFrame((lookup: SymbolTable) =>
      apply(
        kright(
          str("in"),
          alt_sc(kright(str(" "), parserRules.STRING_LITERAL), parserRules.WORD)
        ),
        (iterator: LexValue<any> | string) =>
          new LitValue(() => {
            if (typeof iterator == "string") return iterator;
            iterator.attachTable(lookup);
            return iterator.getValue()().toString();
          })
      )
    ),
  ],
  [
    Argument.Body,
    createFrame((lookup: SymbolTable) =>
      apply(
        parserRules.SENTENCE,
        (sentence: XBarInterface) =>
          new LitValue(() => sentence.assignLookup(lookup))
      )
    ),
  ],
]);
