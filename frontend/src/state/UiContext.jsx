import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const UiContext = createContext(null);

export function UiProvider({ children }) {
  const [a11yMode, setA11yMode] = useState(() => {
    return localStorage.getItem("ulms_a11y") === "on";
  });

  useEffect(() => {
    const v = a11yMode ? "on" : "off";
    document.documentElement.setAttribute("data-a11y", v);
    localStorage.setItem("ulms_a11y", v);
  }, [a11yMode]);

  const value = useMemo(
    () => ({
      a11yMode,
      toggleA11yMode: () => setA11yMode((s) => !s)
    }),
    [a11yMode]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
}