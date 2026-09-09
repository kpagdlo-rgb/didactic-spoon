import { ShieldCheck } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function TopBar() {
  return (
    <header className="topbar">
      <div className="wordmark">
        <span className="mark" aria-hidden="true">
          m
        </span>
        Meder
      </div>
      <div className="topnote">A calmer way to understand an order.</div>
      <div className="topbar-actions">
        <span className="badge">
          <ShieldCheck size={13} strokeWidth={2.2} aria-hidden="true" />
          READ-ONLY BY DESIGN
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
