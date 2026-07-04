-- Yaddaşda saxlanan login-cəhd sayğacını DB-əsaslı sistemə keçiririk,
-- çünki serverless mühitdə (Vercel) in-memory Map hər sorğuda sıfırlana bilər.
create table login_attempts (
  key text primary key,  -- "phone:+994..." və ya "admin:username"
  attempt_count int not null default 0,
  blocked_until timestamptz,
  updated_at timestamptz not null default now()
);
