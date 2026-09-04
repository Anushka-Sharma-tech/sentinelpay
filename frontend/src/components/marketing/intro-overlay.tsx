"use client";

import { useEffect, useState } from "react";

export function IntroOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setVisible(sessionStorage.getItem("sentinelpay-intro") !== "dismissed");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function dismiss() {
    sessionStorage.setItem("sentinelpay-intro", "dismissed");
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="intro-overlay" role="dialog" aria-modal="true">
      <div className="intro-grid" aria-hidden="true" />
      <div className="intro-content">
        <p>SENTINELPAY</p>
        <h1>
          Detecting and mitigating voice-assisted social-engineering payment
          fraud using multimodal AI risk scoring.
        </h1>
        <button className="button intro-button" type="button" onClick={dismiss}>
          Enter SentinelPay
        </button>
      </div>
    </div>
  );
}
