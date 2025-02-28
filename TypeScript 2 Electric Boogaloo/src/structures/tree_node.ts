import { SemanticState } from "./semantic_state";

export { TreeNode };

class TreeNode {
  // Tree Stuff
  private children: TreeNode[] = [];
  private parent: TreeNode | null = null;
  private node_label: string;

  // Meaning Information
  private state?: SemanticState;
  private calcValue(state: SemanticState): string | number | Function {
    throw new Error("This node has not been assigned a calcValue function.");
  }

  constructor(
    node_label: string,
    valueFx: (state: SemanticState) => string | number | Function
  ) {
    this.node_label = node_label;
    this.calcValue = valueFx;
  }

  // ADD A CHILD TO THIS TREENODE
  addChild(child: TreeNode) {
    this.children.push(child);
    child.parent = this;
  }

  // RETURN THE PARENT OF A GIVEN TREENODE
  getParent(): TreeNode | null {
    return this.parent;
  }

  // CALL FX ON ALL TREENODE IN SUBTREE STARTING WITH LEAVES
  traverseBottomUp(fx: (t: TreeNode) => void) {
    this.children.forEach((child: TreeNode) => {
      child.traverseBottomUp(fx);
    });
    fx(this);
  }

  // CALL FX ON ALL TREENODE IN SUBTREE STARTING WITH ROOT
  traverseTopDown(fx: (t: TreeNode) => void) {
    fx(this);
    this.children.forEach((child: TreeNode) => {
      child.traverseTopDown(fx);
    });
  }

  // ASSIGN A STATE TO A TREENODE
  assignState(state: SemanticState) {
    this.state = state;
  }

  // RETREIVE THE VALUE OF THE NODE
  getValue(): string | number | Function {
    if (this.state == undefined) throw new Error("Node is missing a state.");
    return this.calcValue(this.state);
  }
}
