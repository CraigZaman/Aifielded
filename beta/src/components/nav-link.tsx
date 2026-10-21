"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/app" ? pathname === href : pathname === href || (pathname.startsWith(`${href}/`) && !(href === "/app/missions" && pathname === "/app/missions/new"));
  return <Link href={href} aria-current={active ? "page" : undefined}>{children}</Link>;
}
