import Link from "next/link";
import { Check, Circle, Database, ExternalLink, KeyRound } from "lucide-react";
import { Brand } from "@/components/brand";

export default function SetupPage() {
  return (
    <main className="setup-shell">
      <header><Brand /><span className="status-pill">Private beta setup</span></header>
      <section className="setup-panel">
        <div className="setup-title"><span className="setup-icon"><KeyRound size={22} /></span><div><h1>Connect the secure services</h1><p>The product is deployed independently from the demo. It needs its private beta credentials before accounts can be created.</p></div></div>
        <div className="setup-list">
          <div><Check size={18} /><span><strong>Product application</strong><small>Next.js workspace and production flows</small></span><b>Ready</b></div>
          <div><Circle size={18} /><span><strong>Supabase workspace</strong><small>Authentication, database and file storage</small></span><b>Required</b></div>
          <div><Circle size={18} /><span><strong>AI model access</strong><small>Fielded dialogue and structured intelligence</small></span><b>Required</b></div>
          <div><Circle size={18} /><span><strong>Slack and Google</strong><small>Optional for the first account; connect from settings</small></span><b>Next</b></div>
        </div>
        <div className="setup-actions"><Link className="button button-dark" href="mailto:hello@fielded.ai">Continue private beta setup <ExternalLink size={16} /></Link><Link className="button button-quiet" href="https://demo.fielded.ai/"><Database size={16} />Open existing demo</Link></div>
      </section>
    </main>
  );
}
