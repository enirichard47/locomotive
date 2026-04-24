import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Loader2, AlertCircle } from "lucide-react";

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lastSyncedOrderIdRef = useRef<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const orderId = searchParams.get("orderId") || "";

    if (paymentStatus !== "success" || !orderId) {
      setIsSyncing(false);
      setErrorMessage("Missing payment return details.");
      return;
    }

    if (lastSyncedOrderIdRef.current === orderId) {
      return;
    }

    lastSyncedOrderIdRef.current = orderId;

    let mounted = true;
    let retryTimer: number | null = null;
    let attempt = 0;
    const maxAttempts = 10;

    const scheduleRetry = () => {
      if (!mounted || attempt >= maxAttempts) {
        return;
      }

      const delay = Math.min(1500 * Math.max(1, attempt), 10000);
      retryTimer = window.setTimeout(() => {
        void syncPaidStatus();
      }, delay);
    };

    const syncPaidStatus = async () => {
      attempt += 1;
      setIsSyncing(true);
      setErrorMessage(null);

      try {
        const storedMetadata = localStorage.getItem("checkout_delivery_details");
        const parsedMetadata = storedMetadata ? (JSON.parse(storedMetadata) as Record<string, unknown>) : {};
        const storedSessions = localStorage.getItem("checkout_payment_sessions");
        const paymentSessions = storedSessions ? (JSON.parse(storedSessions) as Record<string, string>) : {};
        const sessionId = paymentSessions[orderId] || "";

        const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/confirm-paid`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ metadata: parsedMetadata, sessionId }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          const nextError = payload.error || response.statusText;

          if (/not marked as paid yet/i.test(nextError) && attempt < maxAttempts) {
            scheduleRetry();
            return;
          }

          if (mounted) {
            setErrorMessage(nextError);
            setIsSyncing(false);
          }
          return;
        }

        if (mounted) {
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        const nextError = error instanceof Error ? error.message : "Failed to confirm payment status.";
        if (attempt < maxAttempts) {
          scheduleRetry();
          return;
        }

        setErrorMessage(nextError);
        setIsSyncing(false);
      }
    };

    syncPaidStatus();

    return () => {
      mounted = false;
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] px-4">
      <div className="w-full max-w-lg rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center shadow-lg">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.12)]">
          {errorMessage ? <AlertCircle className="h-7 w-7 text-orange-500" /> : <Check className="h-7 w-7 text-green-500" />}
        </div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          {errorMessage ? "Payment received, syncing failed" : "Payment successful"}
        </h1>
        <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
          {errorMessage
            ? errorMessage
            : isSyncing
              ? "Redirecting you to your dashboard after the order is confirmed."
              : "Finalizing your order now."}
        </p>

        {isSyncing && !errorMessage && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 py-2 text-sm text-[hsl(var(--muted-foreground))]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting you back
          </div>
        )}

        {errorMessage && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-[hsl(var(--primary))] px-5 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))]"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}