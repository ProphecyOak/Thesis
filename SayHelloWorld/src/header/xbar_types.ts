/* eslint-disable @typescript-eslint/no-unused-vars */
export { type XBarType, CompoundXBarType, SimpleTypes, BasicType };

interface XBarType {
  takes(input: XBarType): boolean;
  equals(other: XBarType): boolean;
  chain(second: XBarType): XBarType;
  apply(input: XBarType): XBarType;
  toString(): string;
}

class CompoundXBarType implements XBarType {
  input: XBarType;
  output: XBarType;

  constructor(input: XBarType, output: XBarType) {
    this.input = input;
    this.output = output;
  }

  takes(input: XBarType): boolean {
    return this.input.equals(input);
  }
  equals(other: XBarType): boolean {
    if (!isComplex(other)) return false;
    return this.input.equals(other.input) && this.output.equals(other.output);
  }
  chain(second: XBarType): XBarType {
    if (!isComplex(second) || this.output.equals(second.input))
      throw new Error(
        `Type ${this.toString()} cannot compose with ${second.toString()}.`
      );
    return new CompoundXBarType(this.input, second.output);
  }

  apply(input: XBarType): XBarType {
    if (this.takes(input)) return this.output;
    throw new Error(
      `Type: ${this.toString()} cannot take input type: ${input.toString()}.`
    );
  }
  toString(): string {
    return `<${this.input.toString()},${this.output.toString()}>`;
  }
}

class SimpleXBarType implements XBarType {
  basicType: BasicType;

  constructor(typeValue: BasicType) {
    this.basicType = typeValue;
  }

  takes(_input: XBarType): boolean {
    return false;
  }
  equals(other: XBarType): boolean {
    if (!isSimple(other)) return false;
    return other.basicType == this.basicType;
  }
  chain(_second: XBarType): XBarType {
    throw new Error(`Type: ${this.toString()} cannot compose with any type.`);
  }

  apply(_input: XBarType): XBarType {
    throw new Error(`Type: ${this.toString()} cannot take any input.`);
  }
  toString(): string {
    return this.basicType;
  }
}

enum BasicType {
  Void = "Void",
  String = "String",
  Number = "Number",
}

const SimpleTypes = {
  types: new Map<BasicType, SimpleXBarType>(),
  get(typeValue: BasicType): SimpleXBarType {
    if (!this.types.has(typeValue))
      this.types.set(typeValue, new SimpleXBarType(typeValue));
    return this.types.get(typeValue)!;
  },
};

function isSimple(typeToCheck: XBarType): typeToCheck is SimpleXBarType {
  return typeToCheck instanceof SimpleXBarType;
}

function isComplex(typeToCheck: XBarType): typeToCheck is CompoundXBarType {
  return typeToCheck instanceof CompoundXBarType;
}
