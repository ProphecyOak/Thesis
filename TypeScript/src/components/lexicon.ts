import {
  type Semantic_Type,
  BasicTypes,
  Compound_Type,
} from "../structures/semantic_type";
export { semanticFunction };

class semanticFunction {
  meaning: any;
  semantic_type: Semantic_Type;
  constructor(meaning: any, semantic_type: Semantic_Type) {
    this.meaning = meaning;
    this.semantic_type = semantic_type;
  }
  get_value(): any {
    return this.meaning;
  }
  takes(other: semanticFunction) {
    return this.semantic_type.takes(other.semantic_type);
  }

  static literal(value: number | string) {
    return new semanticFunction(
      value,
      typeof value === "number" ? BasicTypes.NUM : BasicTypes.STRING
    );
  }
}
