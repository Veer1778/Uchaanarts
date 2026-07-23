"use client";


import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, type Address } from "@/context/AuthContext";

/**
 * /account/addresses — edit billing + shipping. Live mode maps directly to
 * Woo's customer.billing/shipping objects.
 */
const empty: Address = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  postcode: "",
  country: "",
  phone: "",
};

const fields: { key: keyof Address; label: string; span?: 1 | 2 }[] = [
  { key: "first_name", label: "First name" },
  { key: "last_name", label: "Last name" },
  { key: "address_1", label: "Address line 1", span: 2 },
  { key: "address_2", label: "Address line 2", span: 2 },
  { key: "city", label: "City" },
  { key: "state", label: "State / Region" },
  { key: "postcode", label: "Postcode" },
  { key: "country", label: "Country" },
  { key: "phone", label: "Phone" },
];

export default function AddressesView() {
  const { user, loading, updateProfile } = useAuth();
  const router = useRouter();

  const [billing, setBilling] = useState<Address>(empty);
  const [shipping, setShipping] = useState<Address>(empty);
  const [copyBilling, setCopyBilling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/account/addresses");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setBilling({ ...empty, ...(user.billing ?? {}) });
      setShipping({ ...empty, ...(user.shipping ?? {}) });
    }
  }, [user]);

  if (loading || !user) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const shipToSave = copyBilling ? billing : shipping;
    const err = await updateProfile({ billing, shipping: shipToSave });
    setBusy(false);
    if (err) setError(err);
    else setSaved(true);
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <Link
        href="/account"
        className="mb-6 inline-block text-[11px] uppercase tracking-[0.28em] text-muted hover:text-ink"
      >
        ← Back to account
      </Link>
      <h1 className="mb-8 font-display text-4xl">Addresses</h1>

      <form onSubmit={submit} className="space-y-10">
        <AddressBlock
          title="Billing address"
          value={billing}
          onChange={setBilling}
        />

        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={copyBilling}
            onChange={(e) => setCopyBilling(e.target.checked)}
            className="h-4 w-4"
          />
          Shipping address is the same as billing
        </label>

        {!copyBilling && (
          <AddressBlock
            title="Shipping address"
            value={shipping}
            onChange={setShipping}
          />
        )}

        {error && (
          <p className="rounded-sm border border-signal/30 bg-signal/5 px-3 py-2 text-sm text-signal">
            {error}
          </p>
        )}
        {saved && (
          <p className="rounded-sm border border-line bg-wash px-3 py-2 text-sm text-muted">
            Addresses saved.
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="bg-ink px-6 py-3 text-xs uppercase tracking-[0.28em] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save addresses"}
        </button>
      </form>
    </main>
  );
}

function AddressBlock({
  title,
  value,
  onChange,
}: {
  title: string;
  value: Address;
  onChange: (a: Address) => void;
}) {
  return (
    <div>
      <h2 className="mb-4 font-display text-2xl">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <label
            key={f.key}
            className={f.span === 2 ? "sm:col-span-2" : undefined}
          >
            <span className="mb-1 block text-[11px] uppercase tracking-[0.24em] text-muted">
              {f.label}
            </span>
            <input
              type={f.key === "phone" ? "tel" : "text"}
              value={value[f.key] ?? ""}
              onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}
              autoComplete={
                f.key === "address_1" ? "address-line1" :
                f.key === "address_2" ? "address-line2" :
                f.key === "city" ? "address-level2" :
                f.key === "state" ? "address-level1" :
                f.key === "postcode" ? "postal-code" :
                f.key === "country" ? "country-name" :
                f.key === "phone" ? "tel" :
                f.key === "first_name" ? "given-name" :
                f.key === "last_name" ? "family-name" : undefined
              }
              className="w-full border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-ink"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
