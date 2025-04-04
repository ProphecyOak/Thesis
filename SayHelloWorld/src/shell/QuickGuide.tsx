import "./QuickGuide.css";

const fakeLexiconVerbs = {
  Bark: ["Barks.", "Bark."],
  Say: ["Says the value of the theme that follows.", "Say <theme>."],
  Save: [
    "Saves the theme under a given destination name.",
    "Save <theme> as <destination>.",
  ],
  For: [
    "Loops through the iterable using the iterator as reference to each item and runs the body.",
    "For each <iterator> in <iterable> <body>.",
  ],
};

const fakeLexiconVariables = {
  true: "true",
  false: "false",
  testVARIABLE: "2",
};

function QuickGuide() {
  return (
    <div id="lexGuide">
      <h2>Starting Lexicon</h2>
      {Object.entries(fakeLexiconVerbs).map(
        ([name, meaning]: [string, string[]]) => (
          <div>
            <div className="lexItemHeader">{name}</div>
            <div style={{ paddingLeft: "2em" }}>
              {meaning[0]}
              <br />
              Frame: `{meaning[1]}`
            </div>
          </div>
        )
      )}
      <br />
      <br />
      <table>
        <tbody>
          {Object.entries(fakeLexiconVariables).map((item) => (
            <tr key={item[0]}>
              <td className="lexItemHeader">{item[0]}</td>
              <td style={{ paddingLeft: 15 }}>{item[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default QuickGuide;
