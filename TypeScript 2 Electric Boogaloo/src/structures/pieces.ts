import { rule, Token } from "typescript-parsec";
import { TreeNode } from "./tree_node";

export { partsOfSpeech, TokenKind, nodeTypes, NodeLabel };

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

const nodeTypes = {
  PRGM: rule<TokenKind, TreeNode<any>>(),
  SENTENCE: rule<TokenKind, TreeNode<any>>(),
  VERB: rule<TokenKind, TreeNode<any>>(),
  LITERAL: rule<TokenKind, TreeNode<any>>(),
  NUMERIC_LITERAL: rule<TokenKind, number>(),
  STRING_LITERAL: rule<TokenKind, string>(),
  STRING_CHARACTER: rule<TokenKind, Token<TokenKind>>(),
};

enum NodeLabel {
  Paragraph,
  Verb_Phrase,
  Literal,
}
