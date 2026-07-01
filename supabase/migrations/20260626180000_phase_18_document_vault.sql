-- Phase 18 — document vault: RERA Form A/B/F + Oqood + SPA + other documents,
-- tracked per deal. Off-plan brokers are legally required to hold Form A
-- (seller-agent agreement, uploaded to Trakheesi for the listing permit),
-- Form B (buyer-agent agreement), and Form F (the binding sale contract —
-- replaced the handwritten MOU); Oqood is the DLD registration certificate.
-- There is no public DLD/Trakheesi API to sync these automatically, so this
-- is a tracked vault (upload + checklist), not a live registry sync.
-- Forward-only; apply with `supabase db push`.

-- The only value ever written today is 'spa' (verified in shipped code —
-- create_deal_with_plan defaults kind to 'spa' and the client never sends any
-- other value yet), so this CHECK is additive and safe.
alter table public.documents
  add constraint documents_kind_check
  check (kind in ('spa', 'form_a', 'form_b', 'form_f', 'oqood', 'noc', 'other'));

alter table public.documents
  add constraint documents_name_len check (length(name) <= 200);
