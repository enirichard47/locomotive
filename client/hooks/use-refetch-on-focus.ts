import { useEffect } from "react";

export function useRefetchOnFocus(refetch: () => void | Promise<void>) {
  useEffect(() => {
    const handleFocus = () => {
      void refetch();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
    };
  }, [refetch]);
}