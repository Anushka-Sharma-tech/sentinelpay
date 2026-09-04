import { ApiError, isRecord, postAuthenticated } from "@/lib/api/client";
import type {
  RazorpayOrderRequest,
  RazorpayOrderResult,
} from "@/lib/types/razorpay";

function parseOrderResult(value: unknown): RazorpayOrderResult {
  if (
    !isRecord(value) ||
    typeof value.order_id !== "string" ||
    value.order_id.length === 0 ||
    typeof value.amount !== "number" ||
    !Number.isFinite(value.amount) ||
    value.amount <= 0 ||
    typeof value.currency !== "string" ||
    value.currency.length === 0 ||
    typeof value.status !== "string" ||
    value.status.length === 0 ||
    typeof value.key_id !== "string"
  ) {
    throw new ApiError(
      "The backend returned a malformed Razorpay order response.",
      200,
    );
  }

  if (!value.key_id.startsWith("rzp_test_")) {
    throw new ApiError(
      "The backend did not return a Razorpay Test Mode Key ID.",
      200,
    );
  }

  return {
    order_id: value.order_id,
    amount: value.amount,
    currency: value.currency,
    status: value.status,
    key_id: value.key_id,
  };
}

export async function createRazorpayOrder(
  request: RazorpayOrderRequest,
  accessToken: string,
) {
  const payload = await postAuthenticated(
    "/api/v1/razorpay/orders",
    request,
    accessToken,
  );

  return parseOrderResult(payload);
}
