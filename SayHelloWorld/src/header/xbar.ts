import { XBarType } from "./xbar_types";

export { XBar };

class XBar {
  valueType: XBarType;

  constructor(valueType: XBarType) {
    this.valueType = valueType;
  }
}
