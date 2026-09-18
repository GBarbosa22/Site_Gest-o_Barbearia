import { getCurrentUserProfile } from "@/services/auth.service";
import { listBarbers, getBarberByUserId } from "@/services/barbers.service";
import { listClients } from "@/services/clients.service";
import { listProducts } from "@/services/products.service";
import { SaleForm } from "@/components/sales/sale-form";
import { createSaleAction } from "@/app/(dashboard)/vendas/actions";

export default async function NovaVendaPage() {
  const user = await getCurrentUserProfile();
  const isAdmin = user?.role === "admin";

  const [clients, products, barbers, lockedBarber] = await Promise.all([
    listClients(),
    listProducts({ onlyActive: true }),
    isAdmin ? listBarbers({ onlyActive: true }) : Promise.resolve([]),
    !isAdmin && user ? getBarberByUserId(user.id) : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nova venda</h1>
        <p className="text-sm text-muted-foreground">Venda de produtos.</p>
      </div>
      <SaleForm
        action={createSaleAction}
        clients={clients}
        products={products}
        barbers={barbers}
        lockedBarber={lockedBarber}
      />
    </div>
  );
}
