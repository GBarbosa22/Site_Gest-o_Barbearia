"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/forms/submit-button";
import { formatCurrency, toISODateString, formatTime } from "@/lib/utils";
import type { AppointmentListItem } from "@/services/appointments.service";
import type { BarberRow, ClientRow, ServiceRow } from "@/types/database.types";
import type { AppointmentFormState } from "@/app/(dashboard)/agenda/actions";

interface AppointmentFormProps {
  action: (state: AppointmentFormState, formData: FormData) => Promise<AppointmentFormState>;
  clients: ClientRow[];
  services: ServiceRow[];
  barbers: BarberRow[];
  /** Quando o usuário logado é barbeiro, a agenda fica travada nele. */
  lockedBarber?: BarberRow | null;
  appointment?: AppointmentListItem;
  defaultDate?: string;
}

export function AppointmentForm({
  action,
  clients,
  services,
  barbers,
  lockedBarber,
  appointment,
  defaultDate,
}: AppointmentFormProps) {
  const [state, formAction] = useFormState<AppointmentFormState, FormData>(action, {
    error: null,
  });

  const startsAt = appointment ? new Date(appointment.starts_at) : null;
  const defaultDateValue = startsAt ? toISODateString(startsAt) : defaultDate ?? toISODateString(new Date());
  const defaultTimeValue = startsAt
    ? formatTime(startsAt)
    : "";

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="client_id">Cliente</Label>
          <Link href="/clientes/novo" className="text-xs text-gold">
            Cadastrar novo
          </Link>
        </div>
        <Select
          id="client_id"
          name="client_id"
          defaultValue={appointment?.client_id ?? ""}
          required
        >
          <option value="" disabled>
            Selecione o cliente
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.full_name}
            </option>
          ))}
        </Select>
      </div>

      {lockedBarber ? (
        <input type="hidden" name="barber_id" value={lockedBarber.id} />
      ) : (
        <div className="space-y-2">
          <Label htmlFor="barber_id">Barbeiro</Label>
          <Select
            id="barber_id"
            name="barber_id"
            defaultValue={appointment?.barber_id ?? ""}
            required
          >
            <option value="" disabled>
              Selecione o barbeiro
            </option>
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.full_name}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="service_id">Serviço</Label>
        <Select
          id="service_id"
          name="service_id"
          defaultValue={appointment?.service_id ?? ""}
          required
        >
          <option value="" disabled>
            Selecione o serviço
          </option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} · {service.duration_minutes}min · {formatCurrency(service.price)}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input id="date" name="date" type="date" defaultValue={defaultDateValue} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Horário</Label>
          <Input id="time" name="time" type="time" defaultValue={defaultTimeValue} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" defaultValue={appointment?.notes ?? ""} rows={3} />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton variant="gold" className="w-full">
        {appointment ? "Salvar alterações" : "Agendar"}
      </SubmitButton>
    </form>
  );
}
