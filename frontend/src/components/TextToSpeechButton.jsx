import React, { useEffect, useState } from "react";

export default function TextToSpeechButton({ text, label = "Read aloud" }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  function stop() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  function speak() {
    if (!supported) return;
    stop();
    const u = new SpeechSynthesisUtterance(text);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }

  if (!supported) return null;

  return (
    <button
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50 a11y-surface a11y-outline"
      onClick={speaking ? stop : speak}
      aria-label={label}
      aria-pressed={speaking}
      type="button"
    >
      {speaking ? "Stop" : "Read"}
    </button>
  );
}