-- Schema do Studio - Gestão para Supabase (PostgreSQL).
--
-- Como usar: abra o painel do seu projeto em supabase.com, vá em
-- "SQL Editor" -> "New query", cole todo este arquivo e clique em "Run".
-- Isso cria as 5 tabelas usadas pelo sistema. Rode uma única vez.

create table if not exists clientes (
  id serial primary key,
  nome text not null,
  empresa text,
  email text,
  whatsapp text,
  criado_em timestamptz not null default now()
);

create table if not exists projetos (
  id serial primary key,
  nome text not null,
  cliente_id integer not null references clientes(id),
  tipos_servico jsonb not null default '[]',
  status text not null default 'Briefing',
  data_inicio date,
  prazo_interno date,
  prazo_entrega date,
  observacoes text,
  criado_em timestamptz not null default now()
);

create table if not exists entregaveis (
  id serial primary key,
  projeto_id integer not null references projetos(id) on delete cascade,
  nome text not null,
  concluido boolean not null default false,
  criado_em timestamptz not null default now()
);

create table if not exists transacoes (
  id serial primary key,
  descricao text not null,
  valor numeric not null check (valor > 0),
  tipo text not null check (tipo in ('entrada', 'saida')),
  categoria text,
  projeto_id integer references projetos(id) on delete set null,
  status_pagamento text not null default 'pago',
  data date not null,
  criado_em timestamptz not null default now()
);

create table if not exists marca_assets (
  id serial primary key,
  cliente_id integer not null references clientes(id) on delete cascade,
  tipo text not null check (tipo in ('cor', 'link')),
  valor text not null,
  rotulo text,
  criado_em timestamptz not null default now()
);

-- Migração: identifica qual perfil (Natan, Lucas ou Matheus) lançou cada
-- registro. `add column if not exists` é seguro rodar de novo em bancos que
-- já existem — não afeta instalações novas nem duplica nada.
alter table clientes add column if not exists criado_por text;
alter table projetos add column if not exists criado_por text;
alter table transacoes add column if not exists criado_por text;
