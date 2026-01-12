import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, LogOut, Settings, Menu, X } from "lucide-react";
import { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const tabs = [
  { path: "/", label: "아카데미 개요" },
  { path: "/week/1", label: "1주차" },
  { path: "/week/2", label: "2주차" },
  { path: "/week/3", label: "3주차" },
  { path: "/week/4", label: "4주차" },
  { path: "/week/5", label: "5주차" },
];

export function Navigation() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0" data-testid="link-logo">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg md:text-xl">일단만들어</span>
          </Link>

          <div className="hidden md:flex flex-1 justify-center">
            <ScrollArea className="max-w-2xl">
              <nav className="flex items-center gap-1">
                {tabs.map((tab) => (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    data-testid={`tab-${tab.path === "/" ? "overview" : tab.path.replace("/week/", "week")}`}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "px-4 py-2 text-sm font-medium whitespace-nowrap",
                        isActive(tab.path) &&
                          "bg-primary/10 text-primary border-b-2 border-primary rounded-b-none"
                      )}
                    >
                      {tab.label}
                    </Button>
                  </Link>
                ))}
              </nav>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {user?.role === "admin" && (
              <Link href="/admin" className="hidden md:block">
                <Button variant="outline" size="sm" data-testid="button-admin">
                  <Settings className="h-4 w-4 mr-2" />
                  관리자
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden md:flex"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            <ScrollArea className="w-full">
              <nav className="flex gap-2 pb-2">
                {tabs.map((tab) => (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`mobile-tab-${tab.path === "/" ? "overview" : tab.path.replace("/week/", "week")}`}
                  >
                    <Button
                      variant={isActive(tab.path) ? "default" : "outline"}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      {tab.label}
                    </Button>
                  </Link>
                ))}
              </nav>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <div className="flex gap-2 pt-2 border-t">
              {user?.role === "admin" && (
                <Link href="/admin" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full" data-testid="mobile-button-admin">
                    <Settings className="h-4 w-4 mr-2" />
                    관리자
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex-1"
                data-testid="mobile-button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
