import "./App.css";
import Shell from "../src/executive/shell.tsx";
import QuickGuide from "./pageElements/QuickGuide.tsx";

function App() {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Shell></Shell>
        <QuickGuide></QuickGuide>
      </div>
    </>
  );
}

export default App;
