export interface RazorpayOrderRequest {
  amount: number;
  currency: "INR";
  receipt: string | null;
  session_id: string;
}

export interface RazorpayOrderResult {
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  key_id: string;
}