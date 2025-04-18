import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import "./Shell.css";
import { captureOutput } from "../tools/tester";
import { NaturalParser } from "../tools/parser";
import { shellLex } from "./shell_lexicon";
import { Lexicon } from "../structure/xBar";

function Shell() {
  type historyItem = { command: string; results: string[]; error: boolean };

  // Tracks all of the previous commands and their outputs.
  const [commandHistory, setHistory] = useState([] as historyItem[]);
  // Keeps track of arrow key command selection height.
  const [currentCommandHeight, modifyCommandHeight] = useState(-1);
  // Holds onto the local scope lexicon.
  const [localLex, changeLocalLex] = useState(new Lexicon(shellLex));

  // Element refs for modifying the shell history and command line.
  const shellHistoryElement = useRef<HTMLDivElement>(
    null as unknown as HTMLDivElement
  );
  const shellInputElement = useRef<HTMLTextAreaElement>(
    null as unknown as HTMLTextAreaElement
  );

  // Changes the current shell command line to contain an old command.
  function setToOldCommand(newHeight: number) {
    shellInputElement.current.value =
      newHeight == -1 ? "" : commandHistory[newHeight].command;
  }
  // Modifies the commandHeight based on arrow key inputs.
  function keyDownChecker(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowUp": {
        const newHeight = Math.min(
          commandHistory.length - 1,
          currentCommandHeight + 1
        );
        modifyCommandHeight(newHeight);
        setToOldCommand(newHeight);
        break;
      }
      case "ArrowDown": {
        const newHeight = Math.max(-1, currentCommandHeight - 1);
        modifyCommandHeight(newHeight);
        setToOldCommand(newHeight);
        break;
      }
    }
  }

  // Checks to see if a new command is done being entered and
  // if so, executes the command.
  function valueChange(event: FormEvent<HTMLTextAreaElement>) {
    switch ((event.nativeEvent as InputEvent).inputType) {
      case "insertText":
        break;
      case "insertLineBreak": {
        const line = (event.target as HTMLTextAreaElement).value;
        const results = new Array<string>();
        const newHistory: historyItem = {
          command: line.replace("\n", ""),
          results: results,
          error: false,
        };
        setHistory([newHistory].concat(commandHistory));
        shellInputElement.current.value = "";
        executeCommand(newHistory);
        break;
      }
    }

    // Uses the parser to evaluate the latest command.
    // Includes a couple of hard commands that clear or reset the shell.
    function executeCommand(history: historyItem) {
      console.log(`Executing: ${history.command}`);
      if (history.command.toLowerCase() == "clear.") {
        console.log("Clearing Console.");
        setHistory([]);
        return;
      }
      if (history.command.toLowerCase() == "reset.") {
        console.log("Resetting Lexicon.");
        changeLocalLex(new Lexicon(shellLex));
        setHistory([]);
        return;
      }
      captureOutput(
        history.results,
        () =>
          NaturalParser.evaluate(
            history.command,
            localLex,
            NaturalParser.parserRules.PARAGRAPH
          ).forEach((x) => x.run(localLex)),
        false,
        true
      );
    }
  }

  return (
    <>
      <div id="shellDiv">
        <div id="shellHistory" ref={shellHistoryElement}>
          {commandHistory.map((history: historyItem, index: number) => (
            <div className="shellLine" key={`commandHistory-${index}`}>
              {`>>> ${history.command}`}
              {history.results.map((output: string, outputIndex: number) => (
                <div
                  key={`command-output-${index}-${outputIndex}`}
                  className={history.error ? "errorOutput" : ""}
                >{`${output}\n`}</div>
              ))}
            </div>
          ))}
        </div>
        <div id="shellInput">
          {">>>"}
          <textarea
            id="shellTextArea"
            ref={shellInputElement}
            rows={1}
            onInput={valueChange}
            onKeyDown={keyDownChecker}
          ></textarea>
        </div>
      </div>
    </>
  );
}

export default Shell;
