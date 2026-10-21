"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ClipboardList, LayoutDashboard, Megaphone, MessageSquareText } from "lucide-react";

type Item = { label: string; href: string; icon: typeof Building2; active: boolean };
const missions = ["/app/missions", "/app/intelligence", "/app/investigations", "/app/publishing", "/app/follow-ups"];
const personal = ["/app/my-day", "/app/conversations", "/app/updates", "/app/communications/respond", "/app/profile", "/app/suggestions", "/app/concerns"];
const match = (path: string, base: string) => path === base || path.startsWith(`${base}/`);

export function WorkspaceNavigation({ management, company, mobile = false }: { management: boolean; company: boolean; mobile?: boolean }) {
  const path = usePathname();
  const myWork = !management || personal.some(base => match(path, base));
  const items: Item[] = myWork ? [
    { label: "My Day", href: "/app/my-day", icon: LayoutDashboard, active: path === "/app/my-day" || path === "/app" },
    { label: "Discussions", href: "/app/conversations", icon: MessageSquareText, active: match(path, "/app/conversations") },
    { label: "Updates", href: "/app/updates", icon: Megaphone, active: match(path, "/app/updates") || match(path, "/app/communications/respond") },
  ] : [
    { label: "Dashboard", href: "/app", icon: LayoutDashboard, active: path === "/app" },
    { label: "Missions", href: "/app/missions", icon: ClipboardList, active: missions.some(base => match(path, base)) },
    { label: "Communications", href: "/app/communications", icon: Megaphone, active: match(path, "/app/communications") },
  ];
  if (company) items.push({ label: "Company", href: "/app/company", icon: Building2, active: match(path, "/app/company") || path === "/app/people" });
  return <>{management && <nav className={mobile ? "workspace-mode mobile-workspace-mode" : "workspace-mode"} aria-label={mobile ? "Mobile workspace view" : "Workspace view"}><Link href="/app/my-day" aria-current={myWork ? "page" : undefined}>My Work</Link><Link href="/app" aria-current={!myWork ? "page" : undefined}>Manage</Link></nav>}<nav className={mobile ? "mobile-workspace-nav" : "primary-nav"} aria-label={mobile ? "Mobile workspace" : "Workspace"}>{items.map(({ label, href, icon: Icon, active }) => <Link key={href} href={href} aria-current={active ? "page" : undefined}><Icon size={18} /><span>{label}</span></Link>)}</nav></>;
}

export function WorkspaceSectionTabs({ management }: { management: boolean }) {
  const path = usePathname();
  const mission = management && missions.some(base => match(path, base));
  const communication = management && match(path, "/app/communications") && !match(path, "/app/communications/respond");
  const items = mission ? [["/app/missions", "Portfolio"], ["/app/intelligence", "Intelligence"], ["/app/investigations", "Investigations"], ["/app/follow-ups", "Follow-up work"], ["/app/publishing", "Approvals"]] : communication ? [["/app/communications", "Communications"], ["/app/communications/new", "New communication"], ["/app/publishing", "Approvals"]] : [];
  if (!items.length) return null;
  return <nav className="section-tabs work-section-tabs" aria-label={mission ? "Mission sections" : "Communication sections"}>{items.map(([href,label]) => <Link key={href} href={href} className={path === href || href === "/app/missions" && path.startsWith("/app/missions/") ? "active" : ""} aria-current={path === href ? "page" : undefined}>{label}</Link>)}</nav>;
}
