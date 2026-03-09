"use client";

import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Search, Menu, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MobileSidebar } from "@/components/mobile-sidebar";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 lg:hidden">
          <Inbox className="h-5 w-5 text-primary" />
          <span className="font-bold">HelpDesk</span>
        </div>

        <div className="relative ml-auto flex-1 max-w-sm hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tickets..."
            className="pl-8"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <ThemeToggle />
          <UserButton />
        </div>
      </header>

      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
