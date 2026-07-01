/**
 * Layout for the "app" route group (everything except the bare /v/[id] view
 * page). Renders the site header + main column. The group's URL is the root
 * (paths are unchanged: /, /dashboard, /upload, etc.); only /v stays outside.
 */
import { SiteHeader } from "@/components/SiteHeader";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
