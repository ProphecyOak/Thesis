import { expectSingleResult, expectEOF } from "typescript-parsec";
import { Argument } from "../header";
import { lexer } from "./parser";
import { ArgumentFrame } from "./wordArgument";
import {
  LexValue,
  LitValue,
  MergeMode,
  MergeValue,
  SymbolTable,
} from "./xValue";

export { testTable };

type VerbMeaning = (value: LexValue<any>) => () => void;
let testTable: SymbolTable<VerbMeaning> = {
  words: new Map<string, VerbMeaning>([
    [
      "Bark",
      (_value: LexValue<any>) => {
        return () => console.log("Woof");
      },
    ],
    [
      "Report",
      (_value: LexValue<any>) => {
        return () => console.log("Breaking News: This might actually work!");
      },
    ],
    [
      "Say",
      (value: LexValue<any>) => {
        return () => {
          let themeFrame = ArgumentFrame.getFrame(
            Argument.Theme,
            new LitValue((theme: string | number) =>
              console.log(theme.toString())
            ),
            testTable
          );
          expectSingleResult(
            expectEOF(themeFrame.parse(lexer.parse(value.getRest())))
          ).getValue()();
        };
      },
    ],
  ]),
  lookup(symbol: string): VerbMeaning {
    return this.words.get(symbol)!;
  },
};
