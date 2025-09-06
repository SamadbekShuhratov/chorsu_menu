import knex from "knex";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = knex({
  client: "sqlite3",
  connection: {
    filename: path.join(__dirname, "database.sqlite"),
  },
  useNullAsDefault: true,
});

// Jadvallarni yaratish (agar mavjud bo‘lmasa)
async function createTables() {
  const hasCategories = await db.schema.hasTable("categories");
  if (!hasCategories) {
    await db.schema.createTable("categories", (table) => {
      table.string("id").primary();
      table.string("name").notNullable();
      table.integer("displayOrder").defaultTo(0);
      table.boolean("active").defaultTo(true);
    });
    console.log("✅ categories jadvali yaratildi");
  }

  const hasMenuItems = await db.schema.hasTable("menu_items");
  if (!hasMenuItems) {
    await db.schema.createTable("menu_items", (table) => {
      table.string("id").primary();
      table.string("name").notNullable();
      table.float("price").notNullable();
      table.string("categoryId").references("id").inTable("categories");
      table.text("description");
      table.string("image");
      table.boolean("available").defaultTo(true);
      table.timestamp("createdAt").defaultTo(db.fn.now());
      table.timestamp("updatedAt").defaultTo(db.fn.now());
    });
    console.log("✅ menu_items jadvali yaratildi");
  }
}

createTables();

export default db;
