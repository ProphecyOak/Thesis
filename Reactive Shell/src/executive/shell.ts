import { evaluate } from "../compiler/components/parser";
import { captureOutput } from "../compiler/components/tester";
import { parserRules } from "../compiler/header";
import { lexicon } from "./shellLex";

export { shellType, getResults, onLoad };

console.log("Shell Code Loaded.");

function onLoad() {
  // const shellHistory = document.getElementById(
  //   "shellHistory"
  // ) as HTMLDivElement;
  const shellInput = document.getElementById(
    "shellTextArea"
  ) as HTMLTextAreaElement;
  shellInput.addEventListener("input", shellType);
}

function getResults(sentenceText: string): string[] {
  const results = new Array<string>();
  const evaluatedSentence = captureOutput(results, () => {
    try {
      return evaluate(parserRules.PARAGRAPH, sentenceText, false);
    } catch {
      console.log("ERROR in parsing");
    }
  });
  captureOutput(results, () => {
    try {
      evaluatedSentence!(lexicon);
    } catch {
      console.log("ERROR in evaluating");
    }
  });
  return results;
}

function shellType(this: HTMLTextAreaElement, event: Event): void {
  console.log(typeof event);
  switch ((event as InputEvent).inputType) {
    case "insertText":
      break;
    case "insertLineBreak":
      console.log("Command Entered.");
      // shellHistory.innerHTML += this.value;
      this.value = "";
  }
}
