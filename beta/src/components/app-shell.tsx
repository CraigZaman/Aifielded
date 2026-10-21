import Link from "next/link";
import { LogOut, Settings, ShieldCheck, UserRound } from "lucide-react";
import { Brand } from "@/components/brand";
import { RefreshWorkspace } from "@/components/refresh-workspace";
import { WorkspaceNavigation, WorkspaceSectionTabs } from "@/components/workspace-navigation";
import { FieldedDialogue } from "@/components/fielded-dialogue";
import { signOut } from "@/app/(auth)/actions";
import { canManage } from "@/lib/auth";
import type { Viewer } from "@/lib/types";

const roleLabels: Record<Viewer["role"], string> = { owner: "Workspace owner", manager: "Management", hr: "HR and People", participant: "Employee", consultant: "Consultant" };

export function AppShell({ viewer, children, companyAccess = false }: { viewer: Viewer; children: React.ReactNode; companyAccess?: boolean }) {
  const management = canManage(viewer.role);
  const initials = viewer.name.split(" ").map(part => part[0]).slice(0, 2).join("");
  return <div className={`app-frame role-${viewer.role}`}>
    <aside className="sidebar"><div className="sidebar-top"><Brand href="/app" /><div className="sidebar-organisation"><span>Organisation</span><strong>{viewer.organisationName}</strong></div><WorkspaceNavigation management={management} company={companyAccess} /></div>
      <div className="sidebar-bottom"><div className="intelligence-health"><strong><ShieldCheck size={14} />Permission-aware workspace</strong></div><Link href="/app/settings"><Settings size={16} />Settings</Link><form action={signOut}><button type="submit"><LogOut size={16} />Sign out</button></form></div>
    </aside>
    <main className="app-main"><header className="workspace-topbar"><div><span>Your Fielded workspace</span><strong>{viewer.organisationName}</strong></div><details className="profile-menu"><summary><span className="avatar">{initials}</span><span><strong>{viewer.name}</strong><small>{roleLabels[viewer.role]}</small></span></summary><nav aria-label="Your account"><Link href="/app/profile"><UserRound size={16} />My Profile</Link><Link href="/app/my-day">My Work</Link>{management && <Link href="/app">Management dashboard</Link>}<Link href="/app/settings"><Settings size={16} />Account settings</Link><form action={signOut}><button type="submit"><LogOut size={16} />Sign out</button></form></nav></details></header>
      <div className="mobile-bar"><Brand href="/app" /><details className="profile-menu mobile-profile-menu"><summary aria-label="Open account menu"><span className="avatar">{initials}</span></summary><nav aria-label="Your account"><Link href="/app/profile"><UserRound size={16} />My Profile</Link><Link href="/app/settings"><Settings size={16} />Account settings</Link><form action={signOut}><button type="submit"><LogOut size={16} />Sign out</button></form></nav></details></div><WorkspaceNavigation management={management} company={companyAccess} mobile /><WorkspaceSectionTabs management={management} /><div className="workspace-refresh"><RefreshWorkspace /></div>{children}
    </main><FieldedDialogue key={viewer.id} userId={viewer.id} />
  </div>;
}
