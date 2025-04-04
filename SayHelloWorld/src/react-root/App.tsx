import "./App.css";
import Shell from "../shell/shell.tsx";
import QuickGuide from "../shell/QuickGuide.tsx";

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
