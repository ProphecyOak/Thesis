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

  // constructor(frameType: Argument, pattern: FramePattern) {
  //   ArgumentFrame.frames.set(frameType, pattern);
  // }
  constructor(
    frameType: Argument,
    pattern: Parser<TokenKind, Value<any>>,
    newValueFx: (val: Value<any>) => Value<any> = (val: Value<any>) => val
  ) {
    ArgumentFrame.frames.set(
      frameType,
      (vBar: Value<any>, lookup: SymbolTable<any>) =>
        apply(
          seq(pattern, parserRules.REST),
          ([newArg, rest]: [Value<any>, string]) => {
            newArg.attachTable(lookup);
            let mergedTheme = new MergeValue(
              MergeMode.Composing,
              newValueFx(newArg),
              vBar
            );
            mergedTheme.attachTable(lookup);
            if (rest.startsWith(" ")) rest = rest.slice(1);
            mergedTheme.setRest(rest);
            return mergedTheme;
          }
        )
    );
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
  alt_sc(parserRules.LITERAL, parserRules.WORD)
);
new ArgumentFrame(
  Argument.Destination,
  kright(str("as"), parserRules.WORD),
  (val: Value<any>) => new LitValue(val)
);
