// İstifadə: node scripts/seed-admin.mjs
// Bu skript layihənin İLK Admin hesabını yaradır. Yalnız bir dəfə işə salınmalıdır.
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import readline from "readline";

// .env.local faylını əl ilə oxuyuruq (dotenv paketi olmadan sadə üsul)
function loadEnv() {
  try {
    const content = readFileSync(".env.local", "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim();
    }
  } catch {
    console.error(".env.local tapılmadı. Əvvəlcə .env.example-dan kopyalayıb doldurun.");
    process.exit(1);
  }
}
loadEnv();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  const username = await ask("Admin istifadəçi adı: ");
  const password = await ask("Admin şifrəsi (min 6 simvol): ");
  rl.close();

  if (password.length < 6) {
    console.error("Şifrə minimum 6 simvol olmalıdır.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const placeholderPhone = `+994000${Date.now().toString().slice(-7)}`;

  const { data, error } = await supabase
    .from("users")
    .insert({
      role: "ADMIN",
      first_name: "Admin",
      last_name: "İstifadəçi",
      phone: placeholderPhone,
      username,
      password_hash: passwordHash,
      status: "ACTIVE",
    })
    .select()
    .single();

  if (error) {
    console.error("Xəta:", error.message);
    process.exit(1);
  }

  console.log("✅ Admin hesabı yaradıldı:", data.username);
}

main();
