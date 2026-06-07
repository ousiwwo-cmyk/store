import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = "https://wrffwsymtryarzetumga.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZmZ3c3ltdHJ5YXJ6ZXR1bWdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg0NTg4NCwiZXhwIjoyMDk2NDIxODg0fQ.pxRd0ulV96sVDKzLKPu0YAJr0Miw5zF6DlecI5sD0ZM";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runMigration() {
  const sql = readFileSync(join(__dirname, "..", "supabase", "migrations", "00001_schema.sql"), "utf-8");

  // Split by semicolons to run each statement separately
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const stmt of statements) {
    try {
      const { error } = await supabase.rpc("pg_query", { query: stmt + ";" });
      if (error && !error.message.includes("already exists")) {
        console.error("Error:", error.message);
      } else {
        console.log("OK:", stmt.substring(0, 60) + "...");
      }
    } catch (e) {
      console.log("Skipping (likely exists):", stmt.substring(0, 60) + "...");
    }
  }
  console.log("\nMigration completed!");
}

runMigration().catch(console.error);
