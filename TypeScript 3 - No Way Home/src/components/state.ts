import { MeaningInterface, StateInterface } from "../header";

class State implements StateInterface {
  isRoot(): boolean {
    throw new Error("State.isRoot() not implemented yet.");
  }
  lookupSymbol(): MeaningInterface<any> {
    throw new Error("State.lookupSymbol() not implemented yet.");
  }
  childState(): StateInterface {
    throw new Error("State.childState() not implemented yet.");
  }
  parentState(): StateInterface {
    throw new Error("State.parentState() not implemented yet.");
  }
}
