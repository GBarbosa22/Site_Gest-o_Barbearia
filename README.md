# Barbearia Gentlemen — Sistema de Gestão

Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase (Postgres, Auth, Storage).
Hospedagem gratuita: Vercel (front-end) + Supabase (backend/banco), sem servidor próprio.

## Fase 1 (entregue)

- Arquitetura do projeto e estrutura de pastas (`app/`, `components/`, `services/`, `lib/`, `hooks/`, `types/`).
- Banco de dados inicial (`supabase/migrations/0001_init.sql`): `users`, `barbers`, `clients`,
  `services`, `appointments`, com RLS e policies por role (admin/barbeiro).
- Autenticação com Supabase Auth (login por e-mail/senha, sessão via cookies, middleware de
  proteção de rotas).
- Layout principal (sidebar + header, tema claro/escuro, paleta preto/grafite/dourado) e navegação
  mobile-first (bottom tab bar) pensada para uso real em iPhone.
- Dashboard com indicadores de hoje/semana/mês.

## Fase 2 (entregue)

- CRUD de barbeiros e catálogo de serviços (admin), CRUD de clientes com busca instantânea e
  histórico completo.

## Fase 3 (entregue)

- **Atendimentos** (`supabase/migrations/0002_payments.sql`): registro rápido do que aconteceu
  (cliente, serviço, forma de pagamento ou "vai pagar depois" com data prevista) — substitui a
  agenda de marcação futura, já que a barbearia usa outro app pra isso.
- **Planos de 4 cortes** (`supabase/migrations/0003_subscriptions.sql`): 1 crédito por semana de
  calendário (segunda a domingo) a partir da compra; crédito não usado até domingo é perdido. Tudo
  calculado em tempo real (`lib/subscription-logic.ts`), sem cron job.
- **Caixa** (`supabase/migrations/0004_cash_register.sql`): abertura com saldo inicial, entradas
  automáticas de pagamentos em dinheiro (corte/plano), saídas manuais (despesa/compra/sangria),
  fechamento com saldo esperado vs. informado. Exclusivo do admin; nunca apaga fechamentos.
- Dashboard com faturamento real (hoje/semana/mês) a partir dos pagamentos.
- Impede 2 planos ativos por cliente ao mesmo tempo, e permite cancelar um plano criado errado
  (`supabase/migrations/0006_one_active_subscription.sql`).

## Fase 4 (entregue)

- **Estoque** (`supabase/migrations/0005_products.sql`): cadastro de produtos com quantidade
  mínima e alerta de estoque baixo. Cada serviço pode ter uma "receita" de produtos (ex.:
  Pigmentação = 1 sachê de tinta) que desconta o estoque automaticamente a cada atendimento.
- **Consumo interno avulso** (`/consumo-interno`): registrar um gasto de produto fora da receita
  automática (ex.: uma lâmina a mais), sem precisar estar vinculado a um atendimento.
- **Venda de produtos** (`supabase/migrations/0007_sales.sql`): venda avulsa ou durante um
  atendimento, com os mesmos métodos de pagamento (ou "vai pagar depois"), desconto automático do
  estoque e entrada automática no caixa.
- **Financeiro** (`/financeiro`, admin): filtros por período (hoje/semana/mês/personalizado) e
  barbeiro; faturamento total e por origem (cortes/planos/produtos), ticket médio, clientes
  novos/recorrentes, ranking de serviços e produtos mais vendidos, faturamento por barbeiro, e
  exportação em CSV (abre no Excel).

## Pré-requisitos

1. Instalar o [Node.js LTS](https://nodejs.org) (não está instalado nesta máquina — instale antes
   de continuar).
2. Criar um projeto gratuito em [supabase.com](https://supabase.com).

## Configuração

```bash
npm install
```

Copie `.env.local.example` para `.env.local` e preencha com as chaves do seu projeto Supabase
(Project Settings > API):

```bash
cp .env.local.example .env.local
```

Rode as migrações no seu projeto Supabase, na ordem, colando cada arquivo no SQL Editor e
clicando Run: `0001_init.sql`, `0002_payments.sql`, `0003_subscriptions.sql`,
`0004_cash_register.sql`, `0005_products.sql`, `0006_one_active_subscription.sql`,
`0007_sales.sql`. Ou via CLI:

```bash
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

### Criar o usuário administrador

No Supabase Dashboard > Authentication > Users > "Add user", crie o seu usuário com e-mail e
senha. Depois, no SQL Editor, promova-o a admin:

```sql
update public.users set role = 'admin' where email = 'seu-email@exemplo.com';
```

(O trigger `on_auth_user_created` já cria a linha em `public.users` automaticamente com role
`barber` por padrão — o comando acima só ajusta o seu usuário para `admin`.)

## Rodando localmente

```bash
npm run dev
```

Acesse `http://localhost:3000` — você será redirecionado para `/login`.

## Ícones do PWA

Adicione `icon-192.png` e `icon-512.png` em `public/icons/` (serão criados/lapidados na Fase 5,
junto com o service worker de instalação).

## Deploy

Suba o repositório para o GitHub e importe na [Vercel](https://vercel.com) (plano free). Configure
as variáveis de ambiente do `.env.local` no painel do projeto na Vercel.

## Próximas fases

- **Fase 5:** Auditoria, relatórios avançados (PDF), PWA completo (service worker), refinamento
  visual.
