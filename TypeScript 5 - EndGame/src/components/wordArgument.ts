import {
  alt,
  alt_sc,
  apply,
  kleft,
  kright,
  nil,
  opt_sc,
  Parser,
  seq,
  str,
  tok,
} from "typescript-parsec";
import { Argument, parserRules, TokenKind } from "../header";
import { LexValue, LitValue, MergeMode, MergeValue, Value } from "./xValue";
import { SymbolTable } from "./lexicon";

export { ArgumentFrame };

type FramePattern = (
  value: Value<any>,
  lookup: SymbolTable<any>
) => Parser<TokenKind, MergeValue<any, any>>;

class ArgumentFrame {
  static frames = new Map<Argument, FramePattern>();

  constructor(frameType: Argument, pattern: FramePattern) {
    ArgumentFrame.frames.set(frameType, pattern);
  }

  static getFrame(
    frameType: Argument,
    value: Value<any>,
    lookup: SymbolTable<any>
  ): Parser<TokenKind, MergeValue<any, any>> {
    if (!ArgumentFrame.frames.has(frameType))
      throw new Error(`No frame has been defined for ${frameType}`);
    return ArgumentFrame.frames.get(frameType)!(value, lookup);
  }
}

new ArgumentFrame(
  Argument.Theme,
  (vBar: Value<any>, lookup: SymbolTable<any>) =>
    apply(
      seq(alt_sc(parserRules.LITERAL, parserRules.WORD), parserRules.REST),
      ([theme, rest]: [Value<any>, string]) => {
        theme.attachTable(lookup);
        let mergedTheme = new MergeValue(MergeMode.Composing, theme, vBar);
        mergedTheme.attachTable(lookup);
        if (rest.startsWith(" ")) rest = rest.slice(1);
        mergedTheme.setRest(rest);
        return mergedTheme;
      }
    )
);
new ArgumentFrame(
  Argument.Destination,
  (vBar: Value<any>, lookup: SymbolTable<any>) =>
    apply(
      seq(kright(str("as"), parserRules.WORD), parserRules.REST),
      ([destination, rest]: [Value<any>, string]) => {
        let mergedTheme = new MergeValue(
          MergeMode.Composing,
          new LitValue(destination),
          vBar
        );
        mergedTheme.attachTable(lookup);
        if (rest.startsWith(" ")) rest = rest.slice(1);
        mergedTheme.setRest(rest);
        return mergedTheme;
      }
    )
);
