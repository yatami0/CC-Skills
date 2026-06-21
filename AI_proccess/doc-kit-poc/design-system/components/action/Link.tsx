import type { ReactNode } from "react";

/** Action: リンク。href はポインタ（内容ではない）。装飾はグローバル。 */
export function Link({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      className="ds-link"
      href={href}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}
    </a>
  );
}
