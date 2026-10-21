"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function RefreshWorkspace() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible" || document.activeElement?.matches("input,textarea,select,[contenteditable=true]")) return;
      startTransition(() => router.refresh());
    };
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [router]);
  return <button className="icon-button" type="button" disabled={pending} title="Refresh workspace" aria-label="Refresh workspace" onClick={() => startTransition(() => router.refresh())}>
    <RefreshCw size={16} className={pending ? "spin" : undefined} />
  </button>;
}
