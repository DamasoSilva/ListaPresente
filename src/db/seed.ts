// Seed script — run with: `node --import tsx --env-file=.env src/db/seed.ts`
// or `npx tsx src/db/seed.ts` after `npm i -D tsx`.
import { eq, sql } from "drizzle-orm";
import { db } from "./index.js";
import {
  admins,
  categories,
  externalProducts,
  products,
  siteConfig,
} from "./schema.js";
import bcrypt from "bcryptjs";

const IMG = (q: string) =>
  `https://images.unsplash.com/photo-${q}?auto=format&fit=crop&w=1200&q=70`;

const SEED_CATEGORIES = [
  { name: "Cozinha", slug: "cozinha", icon: "🍳", order: 1 },
  { name: "Quarto", slug: "quarto", icon: "🛏️", order: 2 },
  { name: "Sala", slug: "sala", icon: "🛋️", order: 3 },
  { name: "Banheiro", slug: "banheiro", icon: "🛁", order: 4 },
  { name: "Lavanderia", slug: "lavanderia", icon: "🧺", order: 5 },
  { name: "Decoração", slug: "decoracao", icon: "🪴", order: 6 },
  { name: "Eletrônicos", slug: "eletronicos", icon: "📺", order: 7 },
  { name: "Ferramentas", slug: "ferramentas", icon: "🛠️", order: 8 },
  { name: "Organização", slug: "organizacao", icon: "📦", order: 9 },
  { name: "Outros", slug: "outros", icon: "✨", order: 10 },
];

const SEED_PRODUCTS = [
  {
    name: "Jogo de Panelas Antiaderente",
    slug: "jogo-de-panelas-antiaderente",
    description: "Conjunto de 5 panelas para nossa nova cozinha.",
    fullDescription:
      "Jogo de panelas antiaderente com 5 peças, cabos de silicone e tampas de vidro. Vai nos acompanhar em todos os almoços de domingo.",
    category: "cozinha",
    imageUrl: IMG("1584990347449-a2d4c2c044c9"),
    total: 1,
    price: "399.00",
    priceRange: "$$$",
    priority: "alta",
    featured: true,
  },
  {
    name: "Jogo de Pratos de Porcelana",
    slug: "jogo-de-pratos-de-porcelana",
    description: "Conjunto de 6 pratos rasos e 6 fundos.",
    category: "cozinha",
    imageUrl: IMG("1603195422604-7f7178e7b6ab"),
    total: 1,
    price: "289.00",
    priceRange: "$$$",
    priority: "alta",
  },
  {
    name: "Jogo de Copos de Vidro",
    slug: "jogo-de-copos-de-vidro",
    description: "6 copos transparentes para o dia a dia.",
    category: "cozinha",
    imageUrl: IMG("1514228742587-6b1558fcca3d"),
    total: 2,
    price: "89.00",
    priceRange: "$$",
    priority: "media",
  },
  {
    name: "Taças de Vinho",
    slug: "tacas-de-vinho",
    description: "6 taças de cristal para noites especiais.",
    category: "cozinha",
    imageUrl: IMG("1510812431401-41d2bd2722f3"),
    total: 6,
    price: "159.00",
    priceRange: "$$",
    priority: "media",
    featured: true,
  },
  {
    name: "Jogo de Toalhas de Banho",
    slug: "jogo-de-toalhas-de-banho",
    description: "Conjunto com 4 toalhas felpudas.",
    category: "banheiro",
    imageUrl: IMG("1600369672770-985fd8f1b9d7"),
    total: 4,
    price: "199.00",
    priceRange: "$$",
    priority: "alta",
  },
  {
    name: "Roupa de Cama Queen",
    slug: "roupa-de-cama-queen",
    description: "Jogo de lençol e fronhas, algodão percal.",
    category: "quarto",
    imageUrl: IMG("1522771739844-6a9f6d5f14af"),
    total: 2,
    price: "349.00",
    priceRange: "$$$",
    priority: "alta",
    featured: true,
  },
  {
    name: "Travesseiros de Pena de Ganso",
    slug: "travesseiros-de-pena-de-ganso",
    description: "Par de travesseiros macios.",
    category: "quarto",
    imageUrl: IMG("1584568694244-14fb218d5bf4"),
    total: 2,
    price: "179.00",
    priceRange: "$$",
    priority: "media",
  },
  {
    name: "Air Fryer 5L",
    slug: "air-fryer-5l",
    description: "Para receitas práticas no dia a dia.",
    category: "cozinha",
    imageUrl: IMG("1585515320310-2598408edb5c"),
    total: 1,
    price: "549.00",
    priceRange: "$$$$",
    priority: "alta",
    featured: true,
  },
  {
    name: "Liquidificador",
    slug: "liquidificador",
    description: "Liquidificador 1200W, 3L.",
    category: "cozinha",
    imageUrl: IMG("1585237017125-24baf8d7406f"),
    total: 1,
    price: "229.00",
    priceRange: "$$$",
    priority: "media",
  },
  {
    name: "Cafeteira Expresso",
    slug: "cafeteira-expresso",
    description: "Para os nossos cafés da manhã juntos.",
    category: "cozinha",
    imageUrl: IMG("1495474472287-4d71bcdd2085"),
    total: 1,
    price: "489.00",
    priceRange: "$$$$",
    priority: "media",
    featured: true,
  },
  {
    name: "Organizador Multiuso",
    slug: "organizador-multiuso",
    description: "Conjunto de caixas organizadoras.",
    category: "organizacao",
    imageUrl: IMG("1558618666-fcd25c85cd64"),
    total: 3,
    price: "99.00",
    priceRange: "$$",
    priority: "baixa",
  },
  {
    name: "Kit de Ferramentas",
    slug: "kit-de-ferramentas",
    description: "Kit básico com 50 peças.",
    category: "ferramentas",
    imageUrl: IMG("1581147019525-2713088eba0f"),
    total: 1,
    price: "259.00",
    priceRange: "$$$",
    priority: "media",
  },
  {
    name: "Lixeira de Inox",
    slug: "lixeira-de-inox",
    description: "Lixeira 30L com pedal.",
    category: "cozinha",
    imageUrl: IMG("1604187351574-c75ca79f5807"),
    total: 2,
    price: "189.00",
    priceRange: "$$",
    priority: "baixa",
  },
  {
    name: "Tapete da Sala",
    slug: "tapete-da-sala",
    description: "Tapete macio, 200x250cm.",
    category: "sala",
    imageUrl: IMG("1600166898405-0d8b18ff2ac8"),
    total: 1,
    price: "699.00",
    priceRange: "$$$$",
    priority: "media",
  },
  {
    name: "Vaso Decorativo",
    slug: "vaso-decorativo",
    description: "Vaso de cerâmica para a estante.",
    category: "decoracao",
    imageUrl: IMG("1485955900006-10f4d324d411"),
    total: 2,
    price: "129.00",
    priceRange: "$$",
    priority: "baixa",
  },
];

const SEED_EXTERNAL = [
  {
    name: "Assinatura de Streaming",
    description: "Para as nossas noites de filme.",
    store: "Netflix",
    price: "55.90",
    url: "https://www.netflix.com",
    category: "Lazer",
    imageUrl: IMG("1489599849927-2ee91cede3ba"),
  },
  {
    name: "Máquina de Lavar 12kg",
    description: "Uma opção que adoramos para a lavanderia.",
    store: "Magalu",
    price: "2899.00",
    url: "https://www.magazineluiza.com.br",
    category: "Lavanderia",
    imageUrl: IMG("1626806787461-102c1bfaaea6"),
  },
  {
    name: "Aspirador Robô",
    description: "Para deixar a casa sempre limpa sem esforço.",
    store: "Amazon",
    price: "1999.00",
    url: "https://www.amazon.com.br",
    category: "Limpeza",
    imageUrl: IMG("1558317374-067fb5f30001"),
  },
];

async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@novolar.com.br";
  const rawPassword = process.env.ADMIN_PASSWORD || "admin123456";
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const [existing] = await db
    .select({ id: admins.id })
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);
  if (existing) return;
  await db.insert(admins).values({
    email,
    passwordHash,
    name: "Administrador",
  });
  console.log(`✅ Admin criado: ${email} / ${rawPassword}`);
}

async function ensureSiteConfig() {
  const defaults: Record<string, string> = {
    coupleNames: "Cíntia & Damaso",
    welcomeTitle: "Lista de Presentes",
    welcomeSubtitle: "Casa Nova",
    welcomeMessage:
      "Cada detalhe da nossa casa está sendo construído com amor e sonhos. Obrigado!",
    howItWorksTitle: "Como funciona?",
    howItWorksSteps: JSON.stringify([
      "Escolha um item que deseja nos presentear.",
      "Reserve o presente pelo site.",
      "Compre o produto onde preferir.",
      "Depois, nos conte! ❤️",
    ]),
    howItWorksFooter: "Ficaremos muito felizes com sua participação!",
    footerThanks: "Obrigado por fazer parte desse momento tão especial!",
    metaTitle: "Lista de Presentes — Casa Nova · Cíntia & Damaso",
    metaDescription:
      "Estamos começando uma nova fase juntos e queremos compartilhar esse momento com você.",
    shareMessage: "Reservei um presente para a nova casa da Cíntia e do Damaso! ❤️",
    tipMessage:
      "Use os filtros para organizar os presentes por categoria, prioridade, faixa de preço ou disponibilidade.",
    confirmationMessage:
      "Você acabou de fazer parte de um pedacinho da nossa nova casa.",
    showGuestNames: "false",
    showProgress: "true",
    showCounters: "true",
  };
  for (const [k, v] of Object.entries(defaults)) {
    await db.execute(sql`
      insert into site_config (key, value, updated_at)
      values (${k}, ${v}, now())
      on conflict (key) do nothing
    `);
  }
}

async function ensureCategories() {
  for (const c of SEED_CATEGORIES) {
    await db
      .insert(categories)
      .values(c)
      .onConflictDoNothing({ target: categories.slug });
  }
}

async function ensureProducts() {
  const allCats = await db.select().from(categories);
  const bySlug = new Map(allCats.map((c) => [c.slug, c.id]));
  for (const p of SEED_PRODUCTS) {
    await db
      .insert(products)
      .values({
        name: p.name,
        slug: p.slug,
        description: p.description,
        fullDescription: p.fullDescription ?? null,
        categoryId: bySlug.get(p.category) ?? null,
        imageUrl: p.imageUrl,
        images: [],
        totalQuantity: p.total,
        reservedQuantity: 0,
        price: p.price,
        priceRange: p.priceRange,
        priority: p.priority,
        featured: (p as { featured?: boolean }).featured ?? false,
        active: true,
      })
      .onConflictDoNothing({ target: products.slug });
  }
}

async function ensureExternal() {
  for (const e of SEED_EXTERNAL) {
    await db.insert(externalProducts).values({
      name: e.name,
      description: e.description,
      imageUrl: e.imageUrl,
      store: e.store,
      price: e.price,
      url: e.url,
      category: e.category,
      featured: false,
      active: true,
    });
  }
}

async function main() {
  await ensureAdmin();
  await ensureSiteConfig();
  await ensureCategories();
  await ensureProducts();
  await ensureExternal();
  console.log("🌱 Seed concluído.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
