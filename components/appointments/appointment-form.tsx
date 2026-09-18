"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import Link from "next/link";
import { Ticket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/forms/submit-button";
import { cn, formatCurrency, toISODateString } from "@/lib/utils";
import type { AttendanceListItem } from "@/services/appointments.service";
import type { UsableSubscription } from "@/services/subscriptions.service";
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
  /** client_id -> plano com crédito disponível nesta semana. */
  usableSubscriptionsByClient?: Record<string, UsableSubscription>;
}

export function AppointmentForm({
  action,
  clients,
  services,
  barbers,
  lockedBarber,
  attendance,
  usableSubscriptionsByClient = {},
}: AttendanceFormProps) {
  const [state, formAction] = useFormState<AttendanceFormState, FormData>(action, {
    error: null,
  });

  const [clientId, setClientId] = useState(attendance?.client_id ?? "");
  const [selectedServiceId, setSelectedServiceId] = useState(attendance?.service_id ?? "");
  const [amount, setAmount] = useState<string>(
    attendance?.payment ? String(attendance.payment.amount) : ""
  );
  const [method, setMethod] = useState<PaymentMethod | "">(attendance?.payment?.method ?? "debito");
  const [usePlan, setUsePlan] = useState(false);

  function handleServiceChange(serviceId: string) {
    setSelectedServiceId(serviceId);
    const service = services.find((s) => s.id === serviceId);
    if (service) setAmount(String(service.price));
  }

  const usableSubscription = clientId ? usableSubscriptionsByClient[clientId] : undefined;
  const showPlanToggle = !attendance && !!usableSubscription;

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
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value);
            setUsePlan(false);
          }}
          required
        >
          <option value="" disabled>
            Selecione o cliente
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.full_name}
              {usableSubscriptionsByClient[client.id] ? " · tem plano disponível" : ""}
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

      {showPlanToggle ? (
        <label
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
            usePlan ? "border-gold bg-gold/10" : "border-border"
          )}
        >
          <input
            type="checkbox"
            name="use_plan"
            checked={usePlan}
            onChange={(e) => setUsePlan(e.target.checked)}
            className="h-5 w-5 accent-current"
          />
          <Ticket className="h-5 w-5 text-gold" />
          <div className="flex-1">
            <p className="text-sm font-medium">Usar corte do plano</p>
            <p className="text-xs text-muted-foreground">
              Cliente tem crédito disponível nesta semana — não cobra separado.
            </p>
          </div>
        </label>
      ) : null}

      {usePlan && usableSubscription ? (
        <input type="hidden" name="subscription_id" value={usableSubscription.id} />
      ) : (
        <>
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
                    checked={method === option.value}
                    onChange={() => setMethod(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {method === "" ? (
            <div className="space-y-2">
              <Label htmlFor="due_date">Data prevista para o pagamento</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                min={toISODateString(new Date())}
                defaultValue={attendance?.payment?.due_date ?? toISODateString(new Date())}
                required
              />
            </div>
          ) : null}
        </>
      )}

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
        {attendance
          ? "Salvar alterações"
          : usePlan
            ? "Registrar atendimento (plano)"
            : `Registrar atendimento${amount ? ` · ${formatCurrency(Number(amount))}` : ""}`}
      </SubmitButton>
    </form>
  );
}
