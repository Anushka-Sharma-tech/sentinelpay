
"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const INTRO_STORAGE_KEY = "sentinelpay-intro-dismissed";
const INTRO_EVENT = "sentinelpay:intro-dismissed";

function subscribe(listener: () => void) {
  window.addEventListener(INTRO_EVENT, listener);

  return () => {
    window.removeEventListener(INTRO_EVENT, listener);
  };
}

function getServerSnapshot() {
  return true;
}

function getClientSnapshot() {
  try {
    return sessionStorage.getItem(INTRO_STORAGE_KEY) !== "dismissed";
  } catch {
    return true;
  }
}

export function IntroOverlay() {
  const visible = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  function dismiss() {
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "dismissed");
    } catch {
      // Continue if browser storage is unavailable.
    }

    window.dispatchEvent(new Event(INTRO_EVENT));
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      className="intro-overlay cinematic-bg"
      role="dialog"
      aria-modal="true"
      aria-label="SentinelPay introduction"
    >
      <div className="intro-ambient" aria-hidden="true" />
      <div className="intro-grid" aria-hidden="true" />
      <div className="intro-vignette" aria-hidden="true" />
      <div className="intro-sheen" aria-hidden="true" />

      <div className="intro-content">
        <Link href="/" className="intro-logo" onClick={dismiss}>
          SentinelPay
        </Link>

        <div className="intro-rule" aria-hidden="true" />

        <p className="intro-kicker">
          Transaction risk intelligence
        </p>

        <h1>
          Detect risk
          <br />
          <em>before payment.</em>
        </h1>

        <p className="intro-copy">
          SentinelPay evaluates transaction and contextual signals,
          assigns a risk score, and gates payment based on the
          resulting decision policy.
        </p>

        <button
          className="button intro-button"
          type="button"
          onClick={dismiss}
        >
          <span>Enter SentinelPay</span>
          <span aria-hidden="true">→</span>
        </button>

        <p className="intro-footnote">
          Transaction intelligence &middot; Payment decisioning
        </p>
      </div>
    </div>
  );
}
