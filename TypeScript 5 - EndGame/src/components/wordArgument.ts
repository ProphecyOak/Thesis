import { alt, alt_sc, apply, nil, Parser } from "typescript-parsec";
import { Argument, parserRules, TokenKind } from "../header";
import {
  LexValue,
  LitValue,
  MergeMode,
  MergeValue,
  SymbolTable,
  Value,
} from "./xValue";

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
      alt_sc(parserRules.LITERAL, parserRules.WORD),
      (theme: Value<any>) => {
        let mergedTheme = new MergeValue(MergeMode.Composing, theme, vBar);
        mergedTheme.attachTable(lookup);
        return mergedTheme;
      }
    )
);
