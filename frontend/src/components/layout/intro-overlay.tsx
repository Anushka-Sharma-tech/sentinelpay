"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const INTRO_STORAGE_KEY = "sentinelpay-intro-dismissed";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    return sessionStorage.getItem(INTRO_STORAGE_KEY) !== "dismissed";
  } catch {
    return true;
  }
}

function getServerSnapshot() {
  return true;
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function IntroOverlay() {
  const visible = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  function dismiss() {
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "dismissed");
    } catch {
      // The native link still works if storage is unavailable.
    }

    notify();
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      className="intro-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="SentinelPay introduction"
    >
      <div className="intro-grid" aria-hidden="true" />

      <div className="intro-content">
        <Link
          href="/"
          className="intro-logo"
          onClick={dismiss}
        >
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
          resulting decision.
        </p>

        <Link
          href="/"
          className="button intro-button"
          onClick={dismiss}
        >
          <span>Enter SentinelPay</span>
          <span aria-hidden="true">{"\u2192"}</span>
        </Link>

        <p className="intro-footnote">
          Transaction intelligence {"\u00b7"} Payment decisioning
        </p>
      </div>
    </div>
  );
}
