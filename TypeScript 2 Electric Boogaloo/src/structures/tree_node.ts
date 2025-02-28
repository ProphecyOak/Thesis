import { Parser } from "typescript-parsec";
import { Verb, Word } from "../components/lexicon";
import { NodeLabel, TokenKind } from "./pieces";
import { SemanticState } from "./semantic_state";

export { TreeNode };

class TreeNode<T> {
  // Tree Stuff
  private children: TreeNode<any>[] = [];
  private parent: TreeNode<any> | null = null;
  private node_label: NodeLabel;

  // Meaning Information
  private word?: Word<T>;
  private state?: SemanticState;
  private calcValue(state: SemanticState): string | number | Function {
    throw new Error("This node has not been assigned a calcValue function.");
  }

  constructor(
    node_label: NodeLabel,
    valueFx: (state: SemanticState) => string | number | Function
  ) {
    this.node_label = node_label;
    this.calcValue = valueFx;
  }

  //Find Argument Grabber
  getArguments(): Parser<TokenKind, any> {
    if (this.word instanceof Verb) return this.word.argumentFinder;
    throw new Error(
      `Trying to get arguments on ${this.word == undefined ? "unassigned" : "wrong kind of"} word.`
    );
  }

  // ADD A CHILD TO THIS TREENODE
  addChild(child: TreeNode<any>) {
    this.children.push(child);
    child.parent = this;
  }

  // RETURN THE PARENT OF A GIVEN TREENODE
  getParent(): TreeNode<any> | null {
    return this.parent;
  }

  // CALL FX ON ALL TREENODE IN SUBTREE STARTING WITH LEAVES
  traverseBottomUp(fx: (t: TreeNode<any>) => void) {
    this.children.forEach((child: TreeNode<any>) => {
      child.traverseBottomUp(fx);
    });
    fx(this);
  }

  // CALL FX ON ALL TREENODE IN SUBTREE STARTING WITH ROOT
  traverseTopDown(fx: (t: TreeNode<any>) => void) {
    fx(this);
    this.children.forEach((child: TreeNode<any>) => {
      child.traverseTopDown(fx);
    });
  }

  // ASSIGN A STATE TO A TREENODE
  assignState(state: SemanticState) {
    this.state = state;
    this.children.forEach((child: TreeNode<any>) => {
      if (child.node_label != NodeLabel.Paragraph)
        child.assignState(this.state as SemanticState);
      else child.assignState(new SemanticState(this.state));
    });
  }

  // RETREIVE THE VALUE OF THE NODE
  getValue(): string | number | Function {
    if (this.state == undefined) throw new Error("Node is missing a state.");
    return this.calcValue(this.state);
  }
}
