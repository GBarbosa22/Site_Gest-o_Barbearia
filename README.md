# Barbearia Gentlemen — Sistema de Gestão

Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase (Postgres, Auth, Storage).
Hospedagem gratuita: Vercel (front-end) + Supabase (backend/banco), sem servidor próprio.

## Fase 1 (entregue)

- Arquitetura do projeto e estrutura de pastas (`app/`, `components/`, `services/`, `lib/`, `hooks/`, `types/`).
- Banco de dados inicial (`supabase/migrations/0001_init.sql`): `users`, `barbers`, `clients`,
  `services`, `appointments`, com RLS e policies por role (admin/barbeiro).
- Autenticação com Supabase Auth (login por e-mail/senha, sessão via cookies, middleware de
  proteção de rotas).
- Layout principal (sidebar + header, tema claro/escuro, paleta preto/grafite/dourado).
- Dashboard com indicadores de hoje/semana/mês e próximos agendamentos (faturamento e estoque
  serão conectados nas Fases 3 e 4, quando as tabelas de pagamentos/produtos existirem).

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

Rode a migração no seu projeto Supabase (SQL Editor > cole o conteúdo de
`supabase/migrations/0001_init.sql` > Run), ou via CLI:

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

- **Fase 2:** CRUD de barbeiros, clientes, serviços e agenda completa.
- **Fase 3:** Fluxo de atendimento, pagamentos, planos de 4 cortes, caixa.
- **Fase 4:** Estoque, consumo interno, vendas, financeiro.
- **Fase 5:** Auditoria, relatórios, PWA completo (service worker), refinamento visual.
