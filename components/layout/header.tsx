"use client";

import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/(dashboard)/actions";
import type { UserRow } from "@/types/database.types";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Header({ user }: { user: UserRow }) {
  return (
    <header
      className="flex h-16 items-center justify-between border-b border-border bg-background px-4 pt-[env(safe-area-inset-top)] md:px-8 md:pt-0"
      style={{ height: "calc(4rem + env(safe-area-inset-top))" }}
    >
      <div>
        <p className="text-sm text-muted-foreground">
          {user.role === "admin" ? "Administrador" : "Barbeiro"}
        </p>
        <p className="text-sm font-medium">Olá, {user.full_name.split(" ")[0]}</p>
      </div>
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>{initials(user.full_name)}</AvatarFallback>
        </Avatar>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="icon" aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
