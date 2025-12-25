import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, Calendar, BarChart3, Wallet, MoreVertical, Info, HelpCircle, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AboutDialog } from "./AboutDialog";
import { HelpDialog } from "./HelpDialog";
import logoImage from "@/assets/logo.png";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const navItems = [
    { icon: Home, label: "خانه", path: "/" },
    { icon: Users, label: "کارفرمایان", path: "/employers" },
    { icon: Calendar, label: "ثبت کار", path: "/work-days" },
    { icon: Wallet, label: "دریافتها", path: "/payments" },
    { icon: BarChart3, label: "گزارش‌ها", path: "/reports" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {location.pathname === "/" && (
        <header className="bg-card border-b border-border sticky top-0 z-10 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setAboutOpen(true)} className="focus:outline-none">
                  <img src={logoImage} alt="لوگو" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                </button>
                <h1 className="text-xl font-bold text-primary"> ثبت کارکرد <span className="text-xs text-muted-foreground py-8">مدیریت کار و درآمد</span> </h1>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-auto min-w-0 p-1 z-50">
                  <DropdownMenuItem onClick={() => setHelpOpen(true)} className="p-1.5 cursor-pointer justify-center">
                    <HelpCircle className="h-5 w-5" />
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAboutOpen(true)} className="p-1.5 cursor-pointer justify-center">
                    <Info className="h-5 w-5" />
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-1.5 cursor-pointer justify-center">
                    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
      )}

      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />

      <main className="container mx-auto px-4 py-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-around items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isHome = item.path === "/";
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center py-3 px-4 transition-colors flex-1",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn("mb-1", isHome ? "h-6 w-6" : "h-5 w-5")} />
                  <span className={cn("font-medium", isHome ? "text-xs" : "text-[10px]")}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};
