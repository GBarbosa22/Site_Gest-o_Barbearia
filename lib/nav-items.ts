import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Package,
  Wallet,
  BarChart3,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  /** Exibido na bottom tab bar do mobile (mantenha no máximo 5 itens marcados). */
  mobilePrimary?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard, mobilePrimary: true },
  { href: "/agenda", label: "Agenda", icon: Calendar, mobilePrimary: true },
  { href: "/clientes", label: "Clientes", icon: Users, mobilePrimary: true },
  { href: "/servicos", label: "Serviços", icon: Scissors, adminOnly: true },
  {
    href: "/estoque",
    label: "Estoque",
    icon: Package,
    adminOnly: true,
    mobilePrimary: true,
  },
  { href: "/financeiro", label: "Financeiro", icon: Wallet, adminOnly: true },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3, adminOnly: true },
  { href: "/auditoria", label: "Auditoria", icon: ShieldCheck, adminOnly: true },
];
