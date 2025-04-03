import {
  alt_sc,
  apply,
  expectEOF,
  expectSingleResult,
  kleft,
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

export { XBar, runSentence };

class XBar implements XBarInterface {
  root: Value<unknown>;
  lookup?: SymbolTable;
  childPhrase: XBar | null = null;
  adjunct: XBar | null = null;
  label: string = "XBar";

  constructor(vBar: Value<unknown>, lookup?: SymbolTable, label?: string) {
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
    if (this.lookup == undefined)
      throw new Error(
        `No lookup table defined when grabbing argument: ${Argument[argType]}.`
      );
    const frame = frames.get(argType)!(this.lookup);
    const currentRest: string = this.getRest();
    try {
      const arg = expectSingleResult(
        expectEOF(frame.parse(lexer.parse(currentRest)))
      );
      arg.attachTable(this.lookup);
      const mergedArg = new MergeValue(MergeMode.Composing, arg, this.root);
      mergedArg.attachTable(this.lookup);
      const newVBar = new XBar(mergedArg, this.lookup, "VBar");
      newVBar.childPhrase = this;
      newVBar.adjunct = new XBar(arg, this.lookup, argType.toString());
      return newVBar;
    } catch (e) {
      throw new Error(
        `Failed to accept ${Argument[argType]} from {${currentRest}}: {${e}}`
      );
    }
  }

  // Make this work differently where it takes original sentence and modifies it?
  optionalArgument(argType: Argument): XBar {
    if (this.lookup == undefined)
      throw new Error(
        `No lookup table defined when grabbing optional argument: ${Argument[argType]}.`
      );
    const frame = frames.get(argType)!(this.lookup);
    const currentRest: string = this.getRest();
    try {
      const arg = expectSingleResult(
        expectEOF(frame.parse(lexer.parse(currentRest)))
      );
      const mergedArg = new MergeValue(MergeMode.Composing, this.root, arg);
      mergedArg.attachTable(this.lookup);
      const newVBar = new XBar(mergedArg, this.lookup, "VBar");
      newVBar.childPhrase = this;
      newVBar.adjunct = new XBar(arg, this.lookup, argType.toString());
      return newVBar;
    } catch {
      // throw new Error(`Has rest length: {${this.getRest().length}}`);
      return this;
    }
  }

  getRest(): string {
    return this.adjunct != undefined
      ? this.adjunct?.root.getRest()
      : this.childPhrase != undefined
      ? this.childPhrase?.root.getRest()
      : this.root.getRest();
  }

  run(lookup?: SymbolTable) {
    if (lookup != undefined) this.assignLookup(lookup);
    this.root.getValue()();
  }

  toString(): string {
    return `{${this.root.getSymbol()}}`;
  }
}

function createFrame<T>(
  pattern: (lookup: SymbolTable) => Parser<TokenKind, Value<T>>
): (lookup: SymbolTable) => Parser<TokenKind, Value<T>> {
  return (lookup: SymbolTable) =>
    apply(
      seq(pattern(lookup), parserRules.REST),
      ([newArg, rest]: [Value<T>, string]) => {
        newArg.attachTable(lookup);
        if (rest.startsWith(" ")) rest = rest.slice(1);
        newArg.setRest(rest);
        return newArg;
      }
    );
}

const frames = new Map<
  Argument,
  (lookup: SymbolTable) => Parser<TokenKind, Value<unknown>>
>([
  [
    Argument.Theme,
    createFrame(() => alt_sc(parserRules.LITERAL, parserRules.WORD)),
  ],
  [
    Argument.Destination,
    createFrame(() =>
      apply(
        kright(str("as"), parserRules.WORD),
        (val: Value<unknown>) => new LitValue(() => val.getSymbol())
      )
    ),
  ],
  [
    Argument.Iterator,
    createFrame(() =>
      apply(
        kright(str("each"), parserRules.WORD),
        (iterator: LexValue<unknown>) =>
          new LitValue(() => iterator.getSymbol())
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
        (iterator: LexValue<unknown> | string) =>
          new LitValue(() => {
            if (typeof iterator == "string") return iterator;
            iterator.attachTable(lookup);
            return iterator.getValue()();
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
  [
    Argument.Multiplier,
    createFrame((lookup: SymbolTable) =>
      apply(
        kleft(
          alt_sc(parserRules.LITERAL, parserRules.WORD),
          seq(str(" "), str("times"))
        ),
        (val: LexValue<unknown> | LitValue<unknown>) => {
          if (typeof val.getValue()() != "number")
            throw new Error("Multiplier must be a number.");
          return new LitValue(() => (sentence: XBarInterface) => {
            for (let i = 0; i < (val.getValue()() as number); i++)
              runSentence(sentence, lookup);
          });
        }
      )
    ),
  ],
]);

function runSentence(sentence: XBarInterface, lookup: SymbolTable) {
  sentence.assignLookup(lookup);
  const XBarToRun = (sentence.root.getValue()() as XBarInterface).assignLookup(
    lookup
  );
  if (XBarToRun.getRest().length > 0)
    throw new Error(
      `Sentence has un-parsed words remaining: {${XBarToRun.getRest()}}`
    );
  XBarToRun.run();
}
