"use client";

import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/forms/submit-button";
import type { ClientRow, BarberRow } from "@/types/database.types";
import type { ClientFormState } from "@/app/(dashboard)/clientes/actions";

interface ClientFormProps {
  action: (state: ClientFormState, formData: FormData) => Promise<ClientFormState>;
  client?: ClientRow;
  barbers: BarberRow[];
}

export function ClientForm({ action, client, barbers }: ClientFormProps) {
  const [state, formAction] = useFormState<ClientFormState, FormData>(action, { error: null });

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nome completo</Label>
        <Input id="full_name" name="full_name" defaultValue={client?.full_name} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" defaultValue={client?.phone ?? ""} placeholder="(11) 90000-0000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            defaultValue={client?.whatsapp ?? ""}
            placeholder="(11) 90000-0000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="birth_date">Data de nascimento</Label>
        <Input id="birth_date" name="birth_date" type="date" defaultValue={client?.birth_date ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferred_barber_id">Barbeiro preferido</Label>
        <Select id="preferred_barber_id" name="preferred_barber_id" defaultValue={client?.preferred_barber_id ?? ""}>
          <option value="">Sem preferência</option>
          {barbers.map((barber) => (
            <option key={barber.id} value={barber.id}>
              {barber.full_name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" defaultValue={client?.notes ?? ""} rows={3} />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton variant="gold" className="w-full">
        {client ? "Salvar alterações" : "Cadastrar cliente"}
      </SubmitButton>
    </form>
  );
}
