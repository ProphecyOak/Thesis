import { Parser, rule, Token } from "typescript-parsec";
import { TreeNode } from "./tree_node";

export {
  partsOfSpeech,
  TokenKind,
  nodeTypes,
  NodeLabel,
  ParserType,
  Argument,
  ArgumentStore,
};

const partsOfSpeech = {
  Verb: "Verb",
  Variable: "Variable",
};

// DEFINE TOKEN TYPES
enum TokenKind {
  Numeric,
  Alpha,
  Space,
  NewLine,
  Quote,
  Other,
}

type ParserType = Parser<TokenKind, any>;

enum Argument {
  Theme,
}

type ArgumentStore = Map<Argument, TreeNode<any>>;

const nodeTypes = {
  PRGM: rule<TokenKind, TreeNode<any>>(),
  SENTENCE: rule<TokenKind, TreeNode<any>[]>(),
  VERB: rule<TokenKind, TreeNode<any>>(),
  LITERAL: rule<TokenKind, TreeNode<any>>(),
  NUMERIC_LITERAL: rule<TokenKind, number>(),
  STRING_LITERAL: rule<TokenKind, string>(),
  STRING_CHARACTER: rule<TokenKind, Token<TokenKind>>(),
};

enum NodeLabel {
  Paragraph,
  Verb,
  Literal,
}
