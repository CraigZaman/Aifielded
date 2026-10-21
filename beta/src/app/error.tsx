"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { AuthCard } from "@/components/auth-card";

export default function PageError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <AuthCard title="This page couldn't load" description="Fielded couldn't complete this request. Please try again in a moment." footer={<Link className="back-link" href="/"><ArrowLeft size={14} />Back to Fielded</Link>}>
    <button className="button button-primary button-full" type="button" onClick={reset}><RefreshCw size={16} />Try again</button>
  </AuthCard>;
}
