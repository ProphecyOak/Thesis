import { TreeLabel, TreeNodeInterface } from "../header";

export { TreeNode };

class TreeNode implements TreeNodeInterface {
  isRoot(): boolean {
    throw new Error("TreeNode.isRoot() not implemented yet.");
  }
  getLabel(): TreeLabel {
    throw new Error("TreeNode.getLabel() not implemented yet.");
  }
  addChild(child: TreeNodeInterface): TreeNodeInterface {
    throw new Error("TreeNode.addChild() not implemented yet.");
  }
  getParent(): TreeNodeInterface {
    throw new Error("TreeNode.getParent() not implemented yet.");
  }
  mapChildren<T>(f: (t: TreeNodeInterface) => T): T[] {
    throw new Error("TreeNode.getParent() not implemented yet.");
  }
}
