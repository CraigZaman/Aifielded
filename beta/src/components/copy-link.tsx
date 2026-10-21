"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyLink({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return <button className="button button-dark" type="button" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1800); }}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy link"}</button>;
}
