create table if not exists public.daily_summaries (
  date text primary key,
  status text not null check (status in ('read', 'unread')),
  generated_at timestamptz not null,
  processed_email_count integer not null,
  items jsonb not null default '[]'::jsonb,
  full_summary text not null,
  read_at timestamptz
);

create index if not exists daily_summaries_date_desc_idx
  on public.daily_summaries (date desc);
