-- Admin girişi telefon deyil, İstifadəçi adı + Şifrə ilə olur (Hissə 2)
alter table users add column username text unique;

-- Admin üçün phone constraint-i boşluğa icazə vermir, ona görə admin qeydiyyatı zamanı
-- unikal placeholder telefon istifadə edilə bilər (seed script-də edilir).
