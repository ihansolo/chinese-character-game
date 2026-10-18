import { useState } from "react";
import { SettingsProvider } from "./context/SettingsContext";
import { Home } from "./screens/Home";
import { Collection } from "./screens/Collection";
import { ParentScreen } from "./screens/ParentScreen";
import { SoundMatchGame } from "./games/sound-match/SoundMatchGame";
import { RadicalBalloonsGame } from "./games/radical-balloons/RadicalBalloonsGame";

export type Screen = "home" | "game1" | "game2" | "collection" | "parent";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const goHome = () => setScreen("home");

  return (
    <SettingsProvider>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: "100vh" }}>
        {screen === "home" && <Home onNavigate={setScreen} />}
        {screen === "game1" && <SoundMatchGame onExit={goHome} />}
        {screen === "game2" && <RadicalBalloonsGame onExit={goHome} />}
        {screen === "collection" && <Collection onExit={goHome} />}
        {screen === "parent" && <ParentScreen onExit={goHome} />}
      </div>
    </SettingsProvider>
  );
}

export default App;
