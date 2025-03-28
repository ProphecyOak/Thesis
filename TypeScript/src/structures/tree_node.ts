import { BasicTypes, Semantic_Type } from "./semantic_type";
import { semantic_state } from "./semantic_state";
import { parts_of_speech } from "./parts_of_speech";

export { tree_node };

class tree_node {
  node_label: string;
  value_type: Semantic_Type | null;
  value: any;
  parent: tree_node | null;
  children: Array<tree_node>;
  state: semantic_state;
  needs_word = false;

  constructor(
    node_label: string,
    value_type: Semantic_Type | null,
    value: any,
    needs_word?: boolean
  ) {
    this.node_label = node_label;
    this.value_type = value_type;
    this.value = value;
    this.children = new Array<tree_node>();
    this.state = new semantic_state(null);
    this.parent = null;
    if (needs_word) this.needs_word = needs_word;
    if (this.value_type == null && !this.needs_word) {
      throw new Error("Missing Type for Node.");
    }
  }

  set_parent(parent: tree_node) {
    this.parent = parent;
    parent.children.push(this);
  }

  get_value(): any {
    if (this.needs_word) {
      const word = this.state.lookup(this.node_label, this.value);
      this.value = word.get_value();
      this.value_type = word.value_type;
      this.needs_word = false;
    }
    return this.value;
  }

  add_child(
    node_label: string,
    value_type: Semantic_Type,
    value: any
  ): tree_node {
    var new_node = new tree_node(node_label, value_type, value);
    new_node.set_parent(this);
    this.children.push(new_node);
    return new_node;
  }

  assignStates(): void {
    this.children.forEach((child: tree_node) => {
      if (child.node_label == "paragraph") {
        child.state = this.state.child_state();
      }
      child.assignStates();
    });
  }

  static literal(value: number | string) {
    return new tree_node(
      "literal",
      typeof value === "number" ? BasicTypes.NUM : BasicTypes.STRING,
      value
    );
  }

  static terminalWord(label: string, word: string): tree_node {
    const new_node = new tree_node(label, null, word, true);
    return new_node;
  }

  print_tree(showValues: boolean = false, indent: number = 0): void {
    var indent_space = "  ".repeat(indent);
    console.log(
      `${indent_space}${this.node_label}` +
        (showValues
          ? `-- Value: ${this.value}, Type: ${this.value_type?.toString()}`
          : ``)
    );
    this.children.forEach((child: tree_node) => {
      child.print_tree(showValues, indent + 1);
    });
  }
}
