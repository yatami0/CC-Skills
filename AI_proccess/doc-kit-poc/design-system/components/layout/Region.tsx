import type { ReactNode } from "react";

/**
 * Layout: スロット枠（compound）。header / body / footer を子に持つ。
 * 内容も page/deck の別も知らない（container-free）。
 */
export function Region({ children }: { children: ReactNode }) {
  return <section className="ds-region">{children}</section>;
}

function Header({ children }: { children: ReactNode }) {
  return <header className="ds-region-header">{children}</header>;
}
function Body({ children }: { children: ReactNode }) {
  return <div className="ds-region-body">{children}</div>;
}
function Footer({ children }: { children: ReactNode }) {
  return <footer className="ds-region-footer">{children}</footer>;
}

Region.Header = Header;
Region.Body = Body;
Region.Footer = Footer;
