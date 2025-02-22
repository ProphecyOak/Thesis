import { BasicTypes, Semantic_Type } from "./semantic_type";
import { semantic_state } from "./semantic_state";

export { tree_node };

class tree_node {
  node_label: string;
  value_type: Semantic_Type;
  value: any;
  parent: tree_node | null;
  children: Array<tree_node>;
  state: semantic_state;

  constructor(node_label: string, value_type: Semantic_Type, value: any) {
    this.node_label = node_label;
    this.value_type = value_type;
    this.value = value;
    this.children = new Array<tree_node>();
    this.state = new semantic_state(null);
    this.parent = null;
  }

  set_parent(parent: tree_node) {
    this.parent = parent;
    parent.children.push(this);
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

  static literal(value: number | string) {
    return new tree_node(
      "literal",
      typeof value === "number" ? BasicTypes.NUM : BasicTypes.STRING,
      value
    );
  }

  print_tree(showValues: boolean = false, indent: number = 0): void {
    var indent_space = "  ".repeat(indent);
    console.log(
      `${indent_space}${this.node_label}` +
        (showValues
          ? `-- Value: ${this.value}, Type: ${this.value_type.toString()}`
          : ``)
    );
    this.children.forEach((child: tree_node) => {
      child.print_tree(showValues, indent + 1);
    });
  }
}
