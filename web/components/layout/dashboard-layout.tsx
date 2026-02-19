"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListFilter, Terminal, Settings, Sun, Moon, Database } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { 
        name: "Review Queue", 
        href: "/queue", 
        icon: ListFilter 
    },
    { 
        name: "API Docs", 
        href: "/docs", 
        icon: LayoutDashboard 
    },
    { 
        name: "Developer", 
        href: "/developer", 
        icon: Terminal 
    },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/20 hidden md:flex flex-col">
        <div className="flex h-14 items-center border-b px-6">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Database className="h-5 w-5" />
            <span>TrailLearn</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="grid gap-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t p-4 flex items-center justify-between bg-muted/10">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Theme</span>
            <ThemeToggle />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}

function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
