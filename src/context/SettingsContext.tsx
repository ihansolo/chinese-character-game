import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Script } from "../data/types";
import { storage } from "../lib/services";

interface SettingsValue {
  script: Script;
  setScript: (script: Script) => void;
}

const SettingsContext = createContext<SettingsValue | null>(null);

const SCRIPT_KEY = "settings.script";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [script, setScriptState] = useState<Script>("traditional");

  useEffect(() => {
    storage.get<Script>(SCRIPT_KEY).then((saved) => {
      if (saved) setScriptState(saved);
    });
  }, []);

  const setScript = (next: Script) => {
    setScriptState(next);
    void storage.set(SCRIPT_KEY, next);
  };

  return <SettingsContext.Provider value={{ script, setScript }}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
