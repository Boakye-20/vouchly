"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VouchlyLogo } from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  Users,
  CalendarClock,
  BarChart3,
  UserCircle,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Browse Partners", icon: Users },
  { href: "/dashboard/sessions", label: "My Sessions", icon: CalendarClock },
  { href: "/dashboard/stats", label: "My Stats", icon: BarChart3 },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, you'd clear the session/token here
    router.push("/");
  };

  return (
    <div className="flex min-h-screen w-full bg-muted/40 font-body">
      <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold font-headline text-primary">
            <VouchlyLogo className="h-6 w-6" />
            <span>Vouchly</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)))
                  ? "bg-muted text-primary"
                  : ""
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4">
           <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col sm:py-4 sm:pl-4">
         <main className="flex-1 p-4 sm:p-6 sm:rounded-tl-xl bg-background shadow-sm">
            {children}
         </main>
      </div>
    </div>
  );
}
