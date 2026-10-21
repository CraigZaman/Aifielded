import Link from "next/link";
import { Brand } from "@/components/brand";

export function AuthCard({ title, description, message, children, footer }: { title: string; description: string; message?: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <main className="auth-shell">
      <div className="auth-brand"><Brand /></div>
      <section className="auth-card">
        <div className="auth-heading"><h1>{title}</h1><p>{description}</p></div>
        {message && <div className="form-message" role="alert">{message}</div>}
        {children}
        <div className="auth-footer">{footer}</div>
      </section>
      <Link className="auth-demo-link" href="https://demo.fielded.ai/">Looking for the product demonstration?</Link>
    </main>
  );
}
