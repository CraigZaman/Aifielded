import Link from "next/link";
import Image from "next/image";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link className="brand" href={href} aria-label="Fielded home">
      <Image src="/fielded-logo.png" alt="Fielded.ai" width={168} height={44} className="brand-logo" priority />
    </Link>
  );
}
