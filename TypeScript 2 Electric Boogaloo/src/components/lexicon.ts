import { Parser, fail, alt_sc, nil, combine, apply } from "typescript-parsec";
import { SemanticState } from "../structures/semantic_state";
import { nodeTypes, TokenKind } from "../structures/pieces";
import { TreeNode } from "../structures/tree_node";

export { type Word, builtins, Verb };

interface Word<T> {
  partOfSpeech: string;
  word: string;
  getParseValue: () => (state: SemanticState) => T;
}

type ParserType = Parser<TokenKind, any>;

enum Argument {
  Theme,
}

type ArgumentStore = Map<Argument, TreeNode<any>>;

const argumentFrames = new Map<Argument, ParserType>();
argumentFrames.set(Argument.Theme, nodeTypes.LITERAL);

class Verb<T> implements Word<T> {
  partOfSpeech: string = "Verb";
  word: string;
  value: (state: SemanticState) => T;
  argumentFinder: ParserType;
  arguments: ArgumentStore = new Map<Argument, TreeNode<any>>();

  constructor(
    word: string,
    value: (state: SemanticState) => T,
    argsToFind: Argument[]
  ) {
    this.word = word;
    this.value = value;
    this.argumentFinder = argumentFinderGenerator(argsToFind, this);
  }

  getParseValue() {
    return this.value;
  }
}

function argumentFinderGenerator<T>(
  argsToFind: Argument[],
  word: Word<T>
): ParserType {
  return combine(
    altArguments(argsToFind),
    (value: { value: TreeNode<any>; argType: Argument }): ParserType => {
      const lastArgIndex = argsToFind.indexOf(value.argType);
      return argumentFinderGenerator(argsToFind.splice(lastArgIndex, 1), word);
    }
  );
}

// FIGURE OUT HOW TO SEND THE CORRECT ARGUMENTS TO THE VERB DEFINITION

function altArguments(argsToFind: Argument[]): ParserType {
  return argsToFind.reduce((acc: ParserType, arg: Argument): ParserType => {
    if (argumentFrames.has(arg))
      return alt_sc(
        apply(argumentFrames.get(arg) as ParserType, (value: TreeNode<any>) => {
          const argHolder = { value: value, argType: arg };
          return argHolder;
        }),
        acc
      );
    throw new Error(`Missing frame for ${arg} argument type`);
  }, fail("Unable to find another valid argument."));
}

const builtins = new Map<string, Word<any>>();

builtins.set(
  "say",
  new Verb(
    "say",
    (state: SemanticState) => {
      (args: { theme: TreeNode<any> }) => () =>
        console.log(args.theme.getValue());
    },
    [Argument.Theme]
  )
);
