import { FormEvent, useRef, useState } from "react";
import "./Shell.css";
import { captureOutput } from "../tools/tester";
import { NaturalParser } from "../tools/parser";
import { shellLex } from "./shell_lexicon";

function Shell() {
  type historyItem = { command: string; results: string[]; error: boolean };
  const [commandHistory, setHistory] = useState([] as historyItem[]);
  const shellHistoryElement = useRef<HTMLDivElement>(
    null as unknown as HTMLDivElement
  );
  const shellInputElement = useRef<HTMLTextAreaElement>(
    null as unknown as HTMLTextAreaElement
  );

  // TODO Bind arrow key to grab old commands

  function valueChange(event: FormEvent<HTMLTextAreaElement>) {
    switch ((event.nativeEvent as InputEvent).inputType) {
      case "insertText":
        break;
      case "insertLineBreak": {
        const line = (event.target as HTMLTextAreaElement).value;
        const results = new Array<string>();
        const newHistory: historyItem = {
          command: line.slice(0, line.length - 1),
          results: results,
          error: false,
        };
        setHistory([newHistory].concat(commandHistory));
        shellInputElement.current.value = "";
        executeCommand(newHistory);
        break;
      }
    }

    function executeCommand(history: historyItem) {
      console.log(`Executing: ${history.command}`);
      if (history.command.toLowerCase() == "clear.") {
        console.log("Clearing Console.");
        setHistory([]);
        return;
      }
      captureOutput(
        history.results,
        () =>
          NaturalParser.evaluate(
            history.command,
            shellLex,
            NaturalParser.parserRules.PARAGRAPH
          ).run(shellLex),
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
          ></textarea>
        </div>
      </div>
    </>
  );
}

export default Shell;
