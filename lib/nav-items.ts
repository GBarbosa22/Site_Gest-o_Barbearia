import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Scissors,
  Ticket,
  Package,
  ShoppingBag,
  Wallet,
  Banknote,
  BarChart3,
  ShieldCheck,
  UserCog,
  PackageMinus,
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
  { href: "/atendimentos", label: "Atendimentos", icon: ClipboardList, mobilePrimary: true },
  { href: "/clientes", label: "Clientes", icon: Users, mobilePrimary: true },
  { href: "/planos", label: "Planos", icon: Ticket },
  { href: "/vendas", label: "Vendas", icon: ShoppingBag },
  { href: "/consumo-interno", label: "Consumo interno", icon: PackageMinus },
  { href: "/barbeiros", label: "Barbeiros", icon: UserCog, adminOnly: true },
  { href: "/servicos", label: "Serviços", icon: Scissors, adminOnly: true },
  { href: "/caixa", label: "Caixa", icon: Banknote, adminOnly: true },
  {
    href: "/produtos",
    label: "Estoque",
    icon: Package,
    adminOnly: true,
    mobilePrimary: true,
  },
  { href: "/financeiro", label: "Financeiro", icon: Wallet, adminOnly: true },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3, adminOnly: true },
  { href: "/auditoria", label: "Auditoria", icon: ShieldCheck, adminOnly: true },
];
