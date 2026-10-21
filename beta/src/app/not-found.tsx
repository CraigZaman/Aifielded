import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthCard } from "@/components/auth-card";

export default function NotFound() {
  return <AuthCard title="Page unavailable" description="This link may no longer be available, or you may not have access to it." footer={<Link href="/">Fielded home</Link>}>
    <Link className="button button-primary button-full" href="/app"><ArrowLeft size={16} />Back to workspace</Link>
  </AuthCard>;
}
