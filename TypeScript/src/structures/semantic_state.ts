import { Semantic_Type } from "./semantic_type";

export { semantic_state };

interface lookupInterface {}

class semantic_state {
  parent_state: semantic_state | null;
  lookup_table: lookupInterface;

  constructor(parent_state: semantic_state | null) {
    this.parent_state = parent_state;
    this.lookup_table = new Map<string, semantic_object>();
  }

  add(new_type: Semantic_Type, new_value: any): semantic_object {
    var new_object = new semantic_object(new_type);
    new_object.set_value(new_value);
    return new_object;
  }
}

class semantic_object {
  object_type: Semantic_Type;
  object_value: any;

  constructor(object_type: Semantic_Type) {
    this.object_type = object_type;
  }

  set_value(new_value: any) {
    this.object_value = new_value;
  }
  get_value(): any {
    return this.object_value;
  }
  set_type(new_type: Semantic_Type) {
    this.object_type = new_type;
  }
  get_type(): Semantic_Type {
    return this.object_type;
  }
}
