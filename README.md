# başlayışqı.online — Mərhələ 1-9 (ən son versiya)

## Hazır olanlar (bütün mərhələlər)

✅ Struktur, database, Authentication
✅ Admin Panel — Dashboard, Sürücü idarəetməsi (əlavə/redaktə/sil/aktiv-deaktiv), Parametrlər
✅ Sürücü + Müştəri panelləri, sifariş formaları
✅ Tam sifariş axını: sürücü seçimi, 2 dəq təsdiq, 5 dəq qiymət artırma
✅ Bildirişlər, Admin sifariş monitorinqi, Reklam sistemi
✅ Elanlar sistemi, CSV Export
✅ Dinamik sistem adı/WhatsApp nömrəsi, Ətraflı Hesabatlar
✅ Şifrə dəyişmə, Sürücü Profili, Admin Sürücü Redaktəsi, 404/500 səhifələri, Offline bildirişi, Splash Screen
✅ **Mərhələ 9 (bu mərhələ — ən vacib 2 düzəliş):**
  - **DB-əsaslı login limiti** — əvvəllər yaddaşda (in-memory) saxlanılırdı və Vercel kimi
    serverless mühitdə hər sorğuda sıfırlana bilirdi. İndi `login_attempts` cədvəlində
    saxlanılır və bütün server instansiyalarında etibarlı işləyir.
  - **Reklam şəkli yükləmə** — admin artıq xarici sayt axtarmadan, birbaşa öz kompüterindən
    şəkil seçib yükləyə bilər (Supabase Storage-a, `ads` adlı ictimai bucket-ə)

## Quraşdırma (YENİ addım var — mütləq oxu)

### 1. Supabase-də SQL-ləri ardıcıl işə sal
Supabase Dashboard → SQL Editor-da **bu ardıcıllıqla**:
1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_admin_username.sql`
3. `supabase/migrations/0003_login_attempts.sql`
4. `supabase/migrations/0004_ads_storage.sql` ← **YENİ**: reklam şəkilləri üçün Storage bucket yaradır

### 2. Kodu quraşdır
```bash
npm install
cp .env.example .env.local   # Supabase məlumatlarını doldur
node scripts/seed-admin.mjs  # ilk admin hesabı
npm run dev
```

### 3. Test ssenarisi
1. `/admin/ads` → "Yeni reklam" → şəkil seç (kompüterindən) → avtomatik yüklənib önizləmə görünəcək
2. 5 dəfə ardıcıl səhv şifrə ilə giriş cəhdi et → 5 dəqiqəlik bloklanma mesajını gör
   (bu, indi server restart etsə belə davam edəcək, çünki DB-də saxlanılır)

## Qalan bilinən məhdudiyyətlər

1. **Realtime = Polling** (3-15 saniyə), əsl Supabase WebSocket Realtime deyil. Bunun
   düzəldilməsi üçün auth sistemini Supabase-in öz Auth-una keçirmək lazımdır ki, RLS
   policy-ləri işləsin — bu, kiçik düzəliş deyil, arxitektur qərarıdır.
2. **PDF/Excel export yoxdur**, yalnız CSV.
3. Testlər (unit/integration) yazılmayıb.

Bunların heç biri gündəlik istifadəni bloklamır — hamısı "production-a tam hazırlıq"
səviyyəsində, MVP səviyyəsində deyil.

### Vercel-ə deploy
GitHub-a yüklə → Vercel "Import Project" → Environment Variables əlavə et → Deploy et

## Ümumi vəziyyət

Tətbiq indi funksional və təhlükəsizlik baxımından sağlam bir MVP-dir: bütün 3 rol, 3 sifariş
növü, tam sifariş həyat dövrü, admin idarəetməsi, bildirişlər, reklam/elan (fayl yükləmə ilə),
hesabatlar, profil idarəetməsi, xəta idarəetməsi və serverless-uyğun təhlükəsizlik mexanizmləri
mövcuddur. Bundan sonrakı addımlar əsasən miqyaslanma və "nice-to-have" xüsusiyyətlərdir.
