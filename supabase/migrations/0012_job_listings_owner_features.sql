-- ============================================================
-- İŞ ELANLARI — Elanlarım (istifadəçi tərəfi) üçün genişləndirmə
-- ============================================================

alter table job_listings
  add column if not exists city text not null default '';

-- Qeyd: 7 günlük ömür müddəti tətbiq səviyyəsində (job-listings.service.ts,
-- LISTING_LIFETIME_DAYS sabiti) idarə olunur, DB səviyyəsində əlavə sütuna
-- ehtiyac yoxdur — mövcud expires_at sütunu kifayətdir.
