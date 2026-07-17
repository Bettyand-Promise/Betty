-- Admin-editable greeting shown in the WhatsApp chat widget on the public site.
alter table public.site_settings
  add column if not exists whatsapp_greeting text not null
  default 'Welcome to Betty & Promise Roofing System. How can we help you with your aluminium roofing today?';
