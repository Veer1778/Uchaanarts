"use client";


import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Package, Heart, UserRound, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatINR } from "@/lib/data";
import Loader from "@/components/Loader";

type Order = {
  id: number;
  number: string;
  date: string;
  status: string;
  total: string;
  items: { name: string; quantity: number }[];
};

const statusLabel: Record<string, string> = {
  completed: "Completed",
  processing: "Processing",
  "on-hold": "On hold",
  pending: "Pending payment",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default function AccountView() {
  const { user, loading, logout } = useAuth();
  const { count: wishCount } = useWishlist();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/account");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/account/orders")
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d) => setOrders(d.orders ?? []))
      .catch(() => setOrders([]));
  }, [user]);

  if (loading || !user) return <Loader />;

  return (
    <section className="relative mx-auto max-w-6xl px-5 pt-14">
      <div className="aura -right-40 top-0 h-80 w-80" />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-signal">
            Your account
          </p>
          <h1 className="font-display text-4xl sm:text-5xl">
            Hello, <span className="text-signal">{user.name || "collector"}</span>
          </h1>
          <p className="mt-2 text-sm text-muted">{user.email}</p>
          {user.demo && (
            <p className="mt-2 text-xs text-faint">
              Demo session — connects to real customer accounts once WordPress is live.
            </p>
          )}
        </div>
        <button
          onClick={async () => {
            await logout();
            router.push("/");
          }}
          className="flex items-center gap-2 border border-ink px-6 py-3 text-[11px] uppercase tracking-[0.18em] transition-colors hover:border-signal hover:text-signal"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      {/* Quick stats + shortcuts */}
      <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/account/profile" className="group bg-paper p-6 transition-colors hover:bg-wash">
          <UserRound size={18} className="text-signal" />
          <p className="mt-3 font-display text-lg">Profile</p>
          <p className="text-sm text-muted group-hover:text-ink">Edit name & email →</p>
        </Link>
        <Link href="/account/addresses" className="group bg-paper p-6 transition-colors hover:bg-wash">
          <MapPin size={18} className="text-signal" />
          <p className="mt-3 font-display text-lg">Addresses</p>
          <p className="text-sm text-muted group-hover:text-ink">Billing & shipping →</p>
        </Link>
        <Link href="/wishlist" className="group bg-paper p-6 transition-colors hover:bg-wash">
          <Heart size={18} className="text-signal" />
          <p className="mt-3 font-display text-lg">
            {wishCount} saved work{wishCount === 1 ? "" : "s"}
          </p>
          <p className="text-sm text-muted group-hover:text-ink">View wishlist →</p>
        </Link>
        <div className="bg-paper p-6">
          <Package size={18} className="text-signal" />
          <p className="mt-3 font-display text-lg">
            {orders === null ? "…" : `${orders.length} order${orders.length === 1 ? "" : "s"}`}
          </p>
          <p className="text-sm text-muted">Lifetime with the gallery</p>
        </div>
      </div>

      {/* Orders */}
      <h2 className="mt-14 font-display text-2xl sm:text-3xl">
        Order <span className="text-signal">history</span>
      </h2>

      {orders === null ? (
        <p className="mt-6 text-sm text-muted">Loading your orders…</p>
      ) : orders.length === 0 ? (
        <div className="mt-6 border border-line p-8 text-center">
          <p className="text-sm text-muted">
            No orders yet — your collection starts in the{" "}
            <Link href="/art-gallery" className="text-signal underline underline-offset-4">
              art gallery
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line border border-line">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="font-medium">Order #{o.number}</p>
                <p className="text-xs text-muted">
                  {new Date(o.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {" · "}
                  {o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                </p>
              </div>
              <span className="rounded-full border border-line px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-muted">
                {statusLabel[o.status] ?? o.status}
              </span>
              <span className="font-display text-lg">{formatINR(Number(o.total))}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
