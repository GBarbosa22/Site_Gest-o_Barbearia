"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/forms/submit-button";
import { cn } from "@/lib/utils";
import type { AttendanceListItem } from "@/services/appointments.service";
import type { BarberRow, ClientRow, ServiceRow, PaymentMethod } from "@/types/database.types";
import type { AttendanceFormState } from "@/app/(dashboard)/atendimentos/actions";

const PAYMENT_OPTIONS: { value: PaymentMethod | ""; label: string }[] = [
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "pix", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "", label: "Vai pagar depois" },
];

interface AttendanceFormProps {
  action: (state: AttendanceFormState, formData: FormData) => Promise<AttendanceFormState>;
  clients: ClientRow[];
  services: ServiceRow[];
  barbers: BarberRow[];
  /** Quando o usuário logado é barbeiro, o atendimento fica travado nele. */
  lockedBarber?: BarberRow | null;
  attendance?: AttendanceListItem;
}

export function AppointmentForm({
  action,
  clients,
  services,
  barbers,
  lockedBarber,
  attendance,
}: AttendanceFormProps) {
  const [state, formAction] = useFormState<AttendanceFormState, FormData>(action, {
    error: null,
  });

  const [selectedServiceId, setSelectedServiceId] = useState(attendance?.service_id ?? "");
  const [amount, setAmount] = useState<string>(
    attendance?.payment ? String(attendance.payment.amount) : ""
  );

  function handleServiceChange(serviceId: string) {
    setSelectedServiceId(serviceId);
    const service = services.find((s) => s.id === serviceId);
    if (service) setAmount(String(service.price));
  }

  const defaultMethod: PaymentMethod | "" = attendance?.payment?.method ?? "";

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="client_id">Cliente</Label>
          <Link href="/clientes/novo" className="text-xs text-gold">
            Cadastrar novo
          </Link>
        </div>
        <Select id="client_id" name="client_id" defaultValue={attendance?.client_id ?? ""} required>
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
            defaultValue={attendance?.barber_id ?? ""}
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
          value={selectedServiceId}
          onChange={(e) => handleServiceChange(e.target.value)}
          required
        >
          <option value="" disabled>
            Selecione o serviço
          </option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discount">Desconto (R$)</Label>
          <Input
            id="discount"
            name="discount"
            type="number"
            min={0}
            step="0.01"
            defaultValue={attendance?.payment?.discount ?? 0}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Pagamento</Label>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_OPTIONS.map((option) => (
            <label
              key={option.value || "pendente"}
              className={cn(
                "flex cursor-pointer items-center justify-center rounded-md border border-input px-2 py-2.5 text-sm font-medium transition-colors has-[:checked]:border-gold has-[:checked]:bg-gold/10 has-[:checked]:text-gold",
                option.value === "" && "col-span-3"
              )}
            >
              <input
                type="radio"
                name="method"
                value={option.value}
                defaultChecked={defaultMethod === option.value}
                className="sr-only"
                required
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" defaultValue={attendance?.notes ?? ""} rows={2} />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton variant="gold" className="w-full">
        {attendance ? "Salvar alterações" : "Registrar atendimento"}
      </SubmitButton>
    </form>
  );
}
