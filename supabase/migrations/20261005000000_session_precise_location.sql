alter table user_sessions
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists location_accuracy numeric,
  add column if not exists formatted_address text;
