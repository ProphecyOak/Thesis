import { Parser, Token } from "typescript-parsec";
import { Argument, MeaningInterface, parserRules, TokenKind } from "../header";

export { frames };

const frames = new Map<Argument, Parser<TokenKind, any>>([
  [Argument.Theme, parserRules.LITERAL],
]);
