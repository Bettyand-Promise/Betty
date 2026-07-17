-- Rebrand existing data: "First Choice Roofing Services" -> "Betty & Promise Roofing System".
-- Column defaults were already changed for fresh installs; this migration updates the
-- rows that were seeded before the rename. Non-destructive: uses replace() so any admin
-- edits around the brand text are preserved, and only touches rows that still contain
-- the old name (safe to re-run / idempotent).

update public.site_settings set
    business_name           = replace(business_name,           'First Choice Roofing Services', 'Betty & Promise Roofing System'),
    default_meta_title      = replace(default_meta_title,      'First Choice Roofing Services', 'Betty & Promise Roofing System'),
    default_meta_description= replace(default_meta_description, 'First Choice Roofing Services', 'Betty & Promise Roofing System'),
    whatsapp_greeting       = replace(whatsapp_greeting,       'First Choice Roofing Services', 'Betty & Promise Roofing System')
  where business_name            like '%First Choice Roofing Services%'
     or default_meta_title       like '%First Choice Roofing Services%'
     or default_meta_description like '%First Choice Roofing Services%'
     or whatsapp_greeting        like '%First Choice Roofing Services%';

update public.about_content set
    headline  = replace(headline,  'First Choice Roofing Services', 'Betty & Promise Roofing System'),
    body_html = replace(body_html, 'First Choice Roofing Services', 'Betty & Promise Roofing System')
  where headline  like '%First Choice Roofing Services%'
     or body_html like '%First Choice Roofing Services%';

update public.articles set
    author = replace(author, 'First Choice Roofing Services', 'Betty & Promise Roofing System')
  where author like '%First Choice Roofing Services%';
