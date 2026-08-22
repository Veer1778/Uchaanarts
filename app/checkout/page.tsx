"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Check, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatINR } from "@/lib/data";

/**
 * Checkout.
 *
 * The browser sends item ids and a delivery address. Prices, GST and shipping
 * are computed server-side from the CMS, and the Razorpay signature is
 * verified there too, so nothing here can change what is charged.
 */

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type Address = {
  first_name: string;
  last_name: string;
  mobile_no: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
};

const EMPTY: Address = {
  first_name: "",
  last_name: "",
  mobile_no: "",
  address: "",
  city: "",
  state: "",
  zipcode: "",
};

export default function CheckoutPage() {
  const { items, totals, quoting, quoteError, clear } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [addr, setAddr] = useState<Address>(EMPTY);
  const [scriptReady, setScriptReady] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ orderNo: string; amount: number } | null>(null);

  // Prefill from the signed-in account, so a returning buyer types less.
  useEffect(() => {
    if (!user) return;
    setAddr((a) => ({
      ...a,
      first_name: a.first_name || user.firstName || user.name?.split(" ")[0] || "",
      last_name: a.last_name || user.lastName || "",
      mobile_no: a.mobile_no || user.phone || "",
    }));
  }, [user]);

  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddr({ ...addr, [k]: e.target.value });

  const placeOrder = async () => {
    setError(null);

    for (const [k, label] of [
      ["first_name", "first name"],
      ["mobile_no", "phone number"],
      ["address", "address"],
      ["city", "city"],
      ["state", "state"],
      ["zipcode", "PIN code"],
    ] as [keyof Address, string][]) {
      if (!addr[k].trim()) return setError(`Please enter your ${label}.`);
    }
    if (!/^\d{10}$/.test(addr.mobile_no.replace(/\D/g, "").slice(-10))) {
      return setError("Please enter a valid 10 digit phone number.");
    }
    if (!window.Razorpay) {
      return setError("Payment library is still loading. Please try again in a moment.");
    }

    setPlacing(true);
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.filter((i) => i.itemId).map((i) => ({ item_id: i.itemId, qty: 1 })),
          shipping: addr,
        }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order?.error ?? "Could not start the payment.");

      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Uchaan Arts",
        description: `Order ${order.order_no}`,
        order_id: order.rzp_order_id,
        prefill: order.prefill,
        theme: { color: "#B5451F" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const v = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                rzp_order_id: response.razorpay_order_id,
                rzp_payment_id: response.razorpay_payment_id,
                rzp_signature: response.razorpay_signature,
              }),
            });
            const vd = await v.json();
            if (!v.ok) throw new Error(vd?.error ?? "Payment could not be verified.");

            clear();
            setDone({ orderNo: vd.order_no, amount: vd.amount });
          } catch (e) {
            // The payment itself succeeded; only our confirmation call failed.
            // Razorpay's webhook will still complete the order, so the buyer
            // should not be told anything went wrong with their money.
            setError(
              e instanceof Error
                ? `${e.message} Your payment may still have gone through — please check your email before trying again.`
                : "Payment taken, but confirmation failed. Please check your email."
            );
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      });

      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPlacing(false);
    }
  };

  // ---- states ----

  if (done) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-24 text-center">
        <Check size={40} className="mx-auto text-signal" />
        <h1 className="mt-6 font-display text-4xl">Thank you</h1>
        <p className="mt-3 text-sm text-muted">
          Order <span className="text-ink">{done.orderNo}</span> is confirmed. A
          receipt is on its way to your inbox, and a curator will be in touch
          about delivery.
        </p>
        <p className="mt-2 font-display text-2xl text-signal">
          {formatINR(done.amount)}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/account"
            className="border border-line px-6 py-3 text-xs uppercase tracking-[0.16em] transition-colors hover:border-signal hover:text-signal"
          >
            View orders
          </Link>
          <Link
            href="/art-gallery"
            className="bg-signal px-6 py-3 text-xs uppercase tracking-[0.16em] text-white transition-colors hover:bg-signal-dark"
          >
            Continue browsing
          </Link>
        </div>
      </main>
    );
  }

  if (authLoading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={22} className="animate-spin text-muted" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-lg px-5 py-24 text-center">
        <Lock size={28} className="mx-auto text-muted" />
        <h1 className="mt-5 font-display text-3xl">Sign in to continue</h1>
        <p className="mt-3 text-sm text-muted">
          We keep your order history and delivery details with your account.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-7 bg-signal px-7 py-3 text-xs uppercase tracking-[0.16em] text-white transition-colors hover:bg-signal-dark"
        >
          Sign in
        </button>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <Link
          href="/art-gallery"
          className="mt-7 inline-block border border-line px-6 py-3 text-xs uppercase tracking-[0.16em] transition-colors hover:border-signal hover:text-signal"
        >
          Browse the gallery
        </Link>
      </main>
    );
  }

  const field =
    "w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-signal";

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptReady(true)}
        strategy="afterInteractive"
      />

      <main className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8">
        <h1 className="font-display text-4xl sm:text-5xl">Checkout</h1>

        <div className="mt-12 grid gap-14 lg:grid-cols-[1.2fr_1fr]">
          {/* Delivery */}
          <section>
            <h2 className="font-display text-2xl">Delivery address</h2>
            <div className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="fn" className="text-xs text-muted">First name</label>
                  <input id="fn" className={field} value={addr.first_name} onChange={set("first_name")} />
                </div>
                <div>
                  <label htmlFor="ln" className="text-xs text-muted">Last name</label>
                  <input id="ln" className={field} value={addr.last_name} onChange={set("last_name")} />
                </div>
              </div>

              <div>
                <label htmlFor="ph" className="text-xs text-muted">Phone</label>
                <input id="ph" type="tel" className={field} value={addr.mobile_no} onChange={set("mobile_no")} />
              </div>

              <div>
                <label htmlFor="ad" className="text-xs text-muted">Address</label>
                <input id="ad" className={field} value={addr.address} onChange={set("address")} placeholder="House / flat, street, area" />
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label htmlFor="ct" className="text-xs text-muted">City</label>
                  <input id="ct" className={field} value={addr.city} onChange={set("city")} />
                </div>
                <div>
                  <label htmlFor="st" className="text-xs text-muted">State</label>
                  <input id="st" className={field} value={addr.state} onChange={set("state")} />
                </div>
                <div>
                  <label htmlFor="zp" className="text-xs text-muted">PIN code</label>
                  <input id="zp" inputMode="numeric" className={field} value={addr.zipcode} onChange={set("zipcode")} />
                </div>
              </div>
            </div>
          </section>

          {/* Summary */}
          <section>
            <h2 className="font-display text-2xl">Your order</h2>

            <ul className="mt-6 space-y-4 border-b border-line pb-6">
              {items.map((i) => (
                <li key={i.slug} className="flex gap-4">
                  <div className="h-20 w-16 shrink-0 overflow-hidden bg-wash">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{i.title}</p>
                    <p className="truncate text-xs text-muted">{i.artistName}</p>
                  </div>
                  <p className="text-sm">{formatINR(i.price)}</p>
                </li>
              ))}
            </ul>

            {quoteError && <p className="mt-4 text-sm text-signal">{quoteError}</p>}

            {totals && (
              <dl className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd>{formatINR(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">GST</dt>
                  <dd>{formatINR(totals.gst)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Delivery</dt>
                  <dd>{totals.shipping === 0 ? "Free" : formatINR(totals.shipping)}</dd>
                </div>
                <div className="mt-3 flex justify-between border-t border-line pt-3 text-base">
                  <dt>Total</dt>
                  <dd className="font-display text-xl text-signal">{formatINR(totals.net)}</dd>
                </div>
              </dl>
            )}

            {quoting && !totals && (
              <p className="mt-6 flex items-center gap-2 text-sm text-muted">
                <Loader2 size={14} className="animate-spin" /> Calculating…
              </p>
            )}

            {error && <p className="mt-5 text-sm text-signal">{error}</p>}

            <button
              onClick={placeOrder}
              disabled={placing || quoting || !totals || !scriptReady}
              className="mt-7 flex w-full items-center justify-center gap-2 bg-signal px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-signal-dark disabled:opacity-60"
            >
              {placing && <Loader2 size={14} className="animate-spin" />}
              {placing ? "Opening payment" : "Pay securely"}
            </button>

            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
              <ShieldCheck size={14} />
              Payments handled by Razorpay. We never see your card details.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
