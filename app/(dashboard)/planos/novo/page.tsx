import { listClients } from "@/services/clients.service";
import { listBarbers } from "@/services/barbers.service";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";
import { createSubscriptionAction } from "@/app/(dashboard)/planos/actions";

export default async function NovoPlanoPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client } = await searchParams;
  const [clients, barbers] = await Promise.all([listClients(), listBarbers({ onlyActive: true })]);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo plano</h1>
        <p className="text-sm text-muted-foreground">Venda do plano de 4 cortes.</p>
      </div>
      <SubscriptionForm
        action={createSubscriptionAction}
        clients={clients}
        barbers={barbers}
        defaultClientId={client}
      />
    </div>
  );
}
