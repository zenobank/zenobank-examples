"use client";

import { useState } from "react";

interface Order {
  id: string;
  status: string;
  amount: string;
  currency: string;
  checkoutUrl: string | null;
  paidAt: string | null;
  createdAt: string;
}

const CURRENCIES = ["USD", "EUR", "GBP", "BRL", "ARS", "MXN"];

export default function Home() {
  const [amount, setAmount] = useState("50");
  const [currency, setCurrency] = useState("USD");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  async function createCheckout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create checkout");
      }

      const data: Order = await res.json();
      setOrder(data);
      startPolling(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function startPolling(orderId: string) {
    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data: Order = await res.json();
          setOrder(data);
          if (data.status !== "PENDING") {
            clearInterval(interval);
            setPolling(false);
          }
        }
      } catch {
        clearInterval(interval);
        setPolling(false);
      }
    }, 3000);
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="w-full max-w-md p-8">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Zenobank Checkout
        </h1>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          Create a crypto payment checkout using the Zenobank SDK.
        </p>

        <form onSubmit={createCheckout} className="space-y-4">
          <div>
            <label
              htmlFor="amount"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Amount
            </label>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder="50.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label
              htmlFor="currency"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "Creating..." : "Create Checkout"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {order && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Order Details
              </h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">ID</dt>
                  <dd className="font-mono text-zinc-900 dark:text-zinc-50">
                    {order.id.slice(0, 8)}...
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">Amount</dt>
                  <dd className="text-zinc-900 dark:text-zinc-50">
                    {order.amount} {order.currency}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500 dark:text-zinc-400">Status</dt>
                  <dd>
                    <StatusBadge status={order.status} />
                  </dd>
                </div>
                {order.paidAt && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500 dark:text-zinc-400">
                      Paid at
                    </dt>
                    <dd className="text-zinc-900 dark:text-zinc-50">
                      {new Date(order.paidAt).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
              {polling && (
                <p className="mt-3 text-xs text-zinc-400">
                  Polling for status updates...
                </p>
              )}
            </div>

            {order.checkoutUrl && order.status === "PENDING" && (
              <a
                href={order.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                Pay Now
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    CANCELLED:
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-zinc-100 text-zinc-800"}`}
    >
      {status}
    </span>
  );
}
