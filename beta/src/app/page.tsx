import Link from "next/link";
import { ArrowRight, Camera, FileUp, Mic, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { hasSupabaseEnv } from "@/lib/env";

export default function Home() {
  const ready = hasSupabaseEnv();
  return (
    <main className="public-shell">
      <header className="public-nav">
        <Brand />
        <div className="nav-actions">
          <Link className="text-link" href="https://demo.fielded.ai/">View product demo</Link>
          <Link className="button button-dark" href={ready ? "/sign-in" : "/setup"}>Sign in</Link>
        </div>
      </header>

      <section className="product-intro">
        <div className="intro-copy">
          <div className="eyebrow"><span className="live-dot" />Private beta</div>
          <h1>See how work actually happens.</h1>
          <p>Fielded gives every company a continuous dialogue layer. It listens across teams, finds operational friction and turns employee context into evidence-backed action.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href={ready ? "/sign-up" : "/setup"}>Create your workspace <ArrowRight size={17} /></Link>
            <span><ShieldCheck size={16} />Confidential by design</span>
          </div>
        </div>

        <div className="dialogue-preview" aria-label="Fielded conversation preview">
          <div className="preview-head">
            <div><span className="pulse" /><strong>Fielded dialogue</strong></div>
            <span className="privacy-state">Contributing confidentially</span>
          </div>
          <div className="preview-body">
            <p className="fielded-message">Good morning. Is there anything slowing your team down today that would be useful for me to understand?</p>
            <p className="person-message">Our approvals are still moving between email and spreadsheets. It creates rework at the end of every week.</p>
            <div className="signal-note"><strong>Signal forming</strong><span>Approval workflow · Operations · 4 related observations</span></div>
          </div>
          <div className="composer-preview">
            <span>Tell Fielded what is happening...</span>
            <div><button aria-label="Record audio"><Mic size={17} /></button><button aria-label="Upload file"><FileUp size={17} /></button><button aria-label="Use camera"><Camera size={17} /></button><button className="send-preview" aria-label="Send"><ArrowRight size={17} /></button></div>
          </div>
        </div>
      </section>

      <section className="system-strip">
        <div><span>01</span><strong>Listen continuously</strong><p>Employee dialogue, missions and connected work systems.</p></div>
        <div><span>02</span><strong>Structure the evidence</strong><p>Observations become themes, hypotheses and findings.</p></div>
        <div><span>03</span><strong>Close the loop</strong><p>Leaders act and employees receive clear follow-up.</p></div>
      </section>
    </main>
  );
}
