import { Parser, fail, alt_sc, nil, combine, apply } from "typescript-parsec";
import { SemanticState } from "../structures/semantic_state";
import {
  Argument,
  nodeTypes,
  ParserType,
  partsOfSpeech,
  TokenKind,
} from "../structures/pieces";
import { TreeNode } from "../structures/tree_node";

export { type Word, builtins, Verb };

interface Word<T> {
  partOfSpeech: string;
  word: string;
  getParseValue: () => (node: TreeNode<T>) => T;
}

const argumentFrames = new Map<Argument, ParserType>();
argumentFrames.set(Argument.Theme, nodeTypes.LITERAL);

class Verb<T> implements Word<T> {
  partOfSpeech: string = partsOfSpeech.Verb;
  word: string;
  value: (node: TreeNode<T>) => T;
  argumentFinder: ParserType;

  constructor(
    word: string,
    value: (node: TreeNode<T>) => T,
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
  word: Word<T>,
  argsCount?: number
): ParserType {
  if (argsCount == 0) return nil();
  return combine(
    altArguments(argsToFind),
    (value: { value: TreeNode<any>; argType: Argument }): ParserType => {
      if (argsCount == undefined) argsCount = argsToFind.length;
      const lastArgIndex = argsToFind.indexOf(value.argType);
      return argumentFinderGenerator(
        argsToFind.splice(lastArgIndex, 1),
        word,
        argsCount - 1
      );
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
    (node: TreeNode<any>) => {
      (args: { theme: TreeNode<any> }) => () =>
        console.log(args.theme.getValue());
    },
    [Argument.Theme]
  )
);
