import "./App.css";
import RoomVisualizer from "./RoomVisualizer";
import { CupBoardProvider } from "./CupBoardProvider";

function App() {
  return (
    <>
      <CupBoardProvider>
        <RoomVisualizer />
      </CupBoardProvider>
    </>
  );
}

export default App;
