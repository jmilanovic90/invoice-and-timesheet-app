create extension if not exists pgcrypto;

create table if not exists public.company_profile (
  id text primary key,
  name text not null default '',
  full_name text not null default '',
  address text not null default '',
  city text not null default '',
  country text not null default '',
  vat_number text not null default '',
  registration_id text not null default '',
  iban_1 text not null default '',
  iban_2 text not null default '',
  iban_3 text not null default '',
  swift text not null default '',
  email text not null default '',
  logo_data_url text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id text primary key,
  name text not null,
  address text not null,
  city text not null,
  country text not null default '',
  vat_number text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id text primary key,
  invoice_number text not null unique,
  invoice_date date not null,
  trading_date date not null,
  trading_place text not null,
  client_id text not null default '',
  issuer_iban text not null default '',
  currency text not null,
  notes text not null default '',
  tax_note text not null default '',
  payment_deadline_days integer not null default 15,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(14, 2) not null default 0,
  discount_total numeric(14, 2) not null default 0,
  grand_total numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.timesheets (
  id text primary key,
  month integer not null,
  year integer not null,
  client_id text not null default '',
  employee_name text not null default '',
  project_name text not null default '',
  target_hours_per_week integer not null default 40,
  submitted_date date not null,
  days jsonb not null default '[]'::jsonb,
  total_hours numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.company_profile (id)
values ('default')
on conflict (id) do nothing;
