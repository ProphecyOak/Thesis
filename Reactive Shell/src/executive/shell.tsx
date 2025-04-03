import { FormEvent, useRef, useState } from "react";
import "./Shell.css";

function Shell() {
  const [latestCommand, setCommand] = useState("");
  const [commandHistory, setHistory] = useState([] as string[]);
  const shellHistoryElement = useRef<HTMLDivElement>(
    null as unknown as HTMLDivElement
  );
  const shellInputElement = useRef<HTMLTextAreaElement>(
    null as unknown as HTMLTextAreaElement
  );
  const historyAnchor = useRef<HTMLDivElement>(
    null as unknown as HTMLDivElement
  );

  function addToHistory(line: string) {
    setCommand(line);
    setHistory(commandHistory.concat([line]));
  }

  function valueChange(event: FormEvent<HTMLTextAreaElement>) {
    switch ((event.nativeEvent as InputEvent).inputType) {
      case "insertText":
        break;
      case "insertLineBreak":
        addToHistory((event.target as HTMLTextAreaElement).value);
        shellInputElement.current.value = "";
        historyAnchor.current.scrollIntoView();
        break;
    }
  }

  return (
    <>
      <div id="shellDiv">
        <div id="shellHistory" ref={shellHistoryElement}>
          {commandHistory.map((command: string) => (
            <div>{`>>> ${command}`}</div>
          ))}
          <div ref={historyAnchor} style={{ height: 30 }}></div>
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
