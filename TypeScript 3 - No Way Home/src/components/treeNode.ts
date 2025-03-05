import { MeaningInterface, TreeLabel, TreeNodeInterface } from "../header";
import { Meaning } from "./meaning";

export { TreeNode };

class TreeNode implements TreeNodeInterface {
  private label: TreeLabel;
  private parent: TreeNodeInterface | undefined;
  private children: TreeNodeInterface[] = new Array<TreeNodeInterface>();
  private text: string;
  private meaning: MeaningInterface<any>;

  constructor(
    label: TreeLabel,
    text: string,
    children?: TreeNodeInterface[],
    parent?: TreeNodeInterface
  ) {
    this.label = label;
    this.text = text;
    this.meaning = new Meaning(this);
    if (parent) this.parent = parent;
    if (children) this.children = children;
  }

  isRoot(): boolean {
    return parent == null;
  }

  getLabel(): TreeLabel {
    return this.label;
  }

  getText(): string {
    return this.text;
  }

  getMeaning(): MeaningInterface<any> {
    return this.meaning;
  }

  addChild(child: TreeNodeInterface): TreeNodeInterface {
    this.children.push(child);
    return this;
  }

  getParent(): TreeNodeInterface {
    if (this.isRoot()) throw new Error("TreeNode has no parent.");
    return this.parent as TreeNodeInterface;
  }

  mapChildren<T>(f: (t: TreeNodeInterface) => T): T[] {
    return this.children.map(f);
  }
}
