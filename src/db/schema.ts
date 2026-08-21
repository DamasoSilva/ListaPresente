import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  jsonb,
  numeric,
} from "drizzle-orm/pg-core";

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 160 }).notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 30 }),
    order: integer("order").default(0).notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("categories_slug_idx").on(table.slug),
    activeIdx: index("categories_active_idx").on(table.active),
  })
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 240 }).notNull(),
    description: text("description"),
    fullDescription: text("full_description"),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    imageUrl: text("image_url"),
    images: jsonb("images").$type<string[]>(),
    totalQuantity: integer("total_quantity").default(1).notNull(),
    reservedQuantity: integer("reserved_quantity").default(0).notNull(),
    price: numeric("price", { precision: 12, scale: 2 }),
    priceRange: varchar("price_range", { length: 5 }).default("$$"),
    priority: varchar("priority", { length: 10 }).default("media"),
    brand: varchar("brand", { length: 120 }),
    model: varchar("model", { length: 120 }),
    notes: text("notes"),
    externalLink: text("external_link"),
    featured: boolean("featured").default(false).notNull(),
    active: boolean("active").default(true).notNull(),
    order: integer("order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("products_slug_idx").on(table.slug),
    activeIdx: index("products_active_idx").on(table.active),
    categoryIdx: index("products_category_idx").on(table.categoryId),
  })
);

export const reservations = pgTable(
  "reservations",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    groupId: varchar("group_id", { length: 80 }),
    guestName: varchar("guest_name", { length: 200 }).notNull(),
    guestEmail: varchar("guest_email", { length: 255 }).notNull(),
    guestPhone: varchar("guest_phone", { length: 40 }).notNull(),
    message: text("message"),
    quantity: integer("quantity").default(1).notNull(),
    status: varchar("status", { length: 30 }).default("reservada").notNull(),
    publicToken: varchar("public_token", { length: 80 }).notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 120 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tokenUnique: uniqueIndex("reservations_token_idx").on(table.publicToken),
    idemIdx: uniqueIndex("reservations_idem_idx").on(table.idempotencyKey),
    productIdx: index("reservations_product_idx").on(table.productId),
    statusIdx: index("reservations_status_idx").on(table.status),
    userIdx: index("reservations_user_idx").on(table.userId),
    groupIdx: index("reservations_group_idx").on(table.groupId),
  })
);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    passwordHash: text("password_hash").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    verificationToken: varchar("verification_token", { length: 120 }),
    verificationExpires: timestamp("verification_expires", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_idx").on(table.email),
  })
);

export const externalProducts = pgTable(
  "external_products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    store: varchar("store", { length: 120 }),
    price: numeric("price", { precision: 12, scale: 2 }),
    url: text("url").notNull(),
    category: varchar("category", { length: 120 }),
    featured: boolean("featured").default(false).notNull(),
    active: boolean("active").default(true).notNull(),
    order: integer("order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    activeIdx: index("external_products_active_idx").on(table.active),
  })
);

export const siteConfig = pgTable(
  "site_config",
  {
    id: serial("id").primaryKey(),
    key: varchar("key", { length: 120 }).notNull().unique(),
    value: text("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    keyUnique: uniqueIndex("site_config_key_idx").on(table.key),
  })
);

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => admins.id, { onDelete: "set null" }),
  action: varchar("action", { length: 80 }).notNull(),
  entity: varchar("entity", { length: 80 }).notNull(),
  entityId: varchar("entity_id", { length: 80 }),
  info: jsonb("info"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  reservations: many(reservations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  reservations: many(reservations),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  product: one(products, {
    fields: [reservations.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
export type ExternalProduct = typeof externalProducts.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type User = typeof users.$inferSelect;
