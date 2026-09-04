"use client";

import { FormEvent, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { createRazorpayOrder } from "@/lib/api/razorpay";
import type { RazorpayOrderResult } from "@/lib/types/razorpay";

function describeOrderError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "Test order creation failed unexpectedly. Try again.";
  }

  if (error.status === 400 || error.status === 422) {
    return `The backend rejected the order: ${error.message}`;
  }

  if (error.status === 403) {
    return error.message;
  }

  if (error.status >= 500) {
    return `The order service could not complete the request: ${error.message}`;
  }

  return error.message;
}

export function RazorpayTestOrder() {
  const [amount, setAmount] = useState(100);
  const [receipt, setReceipt] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<RazorpayOrderResult | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setOrder(null);

    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Enter a valid payment amount.");
      return;
    }

    const sessionId =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem("sentinelpay_session_id")
        : null;

    if (!sessionId) {
      setMessage(
        "Run a transaction risk analysis first. Payment orders require the current risk assessment session.",
      );
      return;
    }

    setLoading(true);

    try {
      const createdOrder = await createRazorpayOrder({
        amount,
        currency: "INR",
        receipt: receipt.trim() || null,
        session_id: sessionId,
      });

      setOrder(createdOrder);
    } catch (error) {
      setMessage(describeOrderError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkout-layout">
      <form className="test-order-form" onSubmit={handleSubmit}>
        <div className="test-order-header">
          <span className="test-mode-mark">Razorpay Test Mode</span>
          <h2>Create a test order</h2>
          <p>
            A current SentinelPay risk assessment is required before an order
            can be created. No card, UPI, or bank details are collected.
          </p>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="order-amount">Amount (₹)</label>
            <input
              id="order-amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              required
            />
            <span className="field-help">
              FastAPI converts rupees to paise before calling Razorpay.
            </span>
          </div>

          <div className="field">
            <label htmlFor="order-currency">Currency</label>
            <input id="order-currency" value="INR" readOnly />
            <span className="field-help">
              Matches the current backend request default.
            </span>
          </div>
        </div>

        <div className="field">
          <label htmlFor="order-receipt">Receipt reference (optional)</label>
          <input
            id="order-receipt"
            value={receipt}
            placeholder="test-order-001"
            onChange={(event) => setReceipt(event.target.value)}
          />
          <span className="field-help">
            Blank values use the backend&apos;s sentinelpay-test fallback.
          </span>
        </div>

        {message && (
          <div
            className="form-message form-message-error"
            role="alert"
            aria-live="polite"
          >
            {message}
          </div>
        )}

        <button
          className="button"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="button-spinner" aria-hidden="true" />
              Creating test order…
            </>
          ) : (
            <>
              <Icon name="shield" width={16} height={16} />
              Create test order
            </>
          )}
        </button>
      </form>

      <aside className="checkout-summary">
        <span className="test-mode-mark">No payment attempted</span>

        <h2>{order ? "Order created" : "Order response"}</h2>

        {order ? (
          <>
            <div className="checkout-row">
              <span>Order ID</span>
              <strong className="mono">{order.order_id}</strong>
            </div>

            <div className="checkout-row">
              <span>Amount</span>
              <strong>
                ₹
                {(order.amount / 100).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </div>

            <div className="checkout-row">
              <span>Currency</span>
              <strong>{order.currency}</strong>
            </div>

            <div className="checkout-row">
              <span>Status</span>
              <strong>{order.status}</strong>
            </div>

            <div className="checkout-row">
              <span>Test Key ID</span>
              <strong className="mono">
                {order.key_id.slice(0, 9)}…{order.key_id.slice(-4)}
              </strong>
            </div>

            <div className="form-message form-message-success">
              The backend created a Razorpay Test Mode order. Checkout and
              payment verification are not implemented.
            </div>
          </>
        ) : (
          <div className="checkout-empty">
            <Icon name="shield" width={24} height={24} />
            <p>
              The order ID, paise amount, status, and public test Key ID will
              appear here after an allowed risk assessment.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
