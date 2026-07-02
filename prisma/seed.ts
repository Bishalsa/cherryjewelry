import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Clear existing data
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.warehouse.deleteMany({});
  
  console.log("Cleared existing data.");

  // 2. Create Default Warehouse
  const warehouse = await prisma.warehouse.create({
    data: {
      name: "Main Warehouse Mumbai",
      code: "WH-MUM-01",
      address: "123 Industrial Area",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      isDefault: true,
    }
  });

  // 3. Create Categories
  const catRings = await prisma.category.create({ data: { name: "Rings", slug: "rings", description: "Exquisite rings", position: 1 } });
  const catNecklaces = await prisma.category.create({ data: { name: "Necklaces", slug: "necklaces", description: "Stunning necklaces", position: 2 } });
  const catEarrings = await prisma.category.create({ data: { name: "Earrings", slug: "earrings", description: "Elegant earrings", position: 3 } });
  const catBracelets = await prisma.category.create({ data: { name: "Bracelets", slug: "bracelets", description: "Beautiful bracelets", position: 4 } });
  const catPendants = await prisma.category.create({ data: { name: "Pendants", slug: "pendants", description: "Charming pendants", position: 5 } });
  const catBangles = await prisma.category.create({ data: { name: "Bangles", slug: "bangles", description: "Traditional bangles", position: 6 } });

  // 4. Create Products
  const prod1 = await prisma.product.create({
    data: {
      name: "Celestial Diamond Ring",
      slug: "celestial-diamond-ring",
      description: "A breathtaking ring featuring a brilliant-cut diamond surrounded by a halo of smaller diamonds, set in 18K yellow gold.",
      shortDescription: "18K Gold brilliant-cut diamond halo ring",
      price: 45999,
      compareAtPrice: 52999,
      costPrice: 32000,
      sku: "LUM-RNG-001",
      material: "Gold (18K)",
      weight: "4.2g",
      purity: "750",
      categoryId: catRings.id,
      tags: ["diamond", "engagement", "halo", "gold"],
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      averageRating: 4.8,
      reviewCount: 24,
      variants: {
        create: [
          { name: "Size 6", sku: "LUM-RNG-001-6", price: 45999, compareAtPrice: 52999, material: "Gold (18K)", size: "6", weight: "4.2g" },
          { name: "Size 7", sku: "LUM-RNG-001-7", price: 45999, compareAtPrice: 52999, material: "Gold (18K)", size: "7", weight: "4.5g" },
        ]
      }
    },
    include: { variants: true }
  });

  const prod2 = await prisma.product.create({
    data: {
      name: "Aria Gold Necklace",
      slug: "aria-gold-necklace",
      description: "An elegant 22K gold necklace with intricate filigree work and a stunning center pendant.",
      shortDescription: "22K Gold filigree necklace with center pendant",
      price: 78500,
      compareAtPrice: 89999,
      costPrice: 58000,
      sku: "LUM-NCK-001",
      material: "Gold (22K)",
      weight: "18.5g",
      purity: "916",
      categoryId: catNecklaces.id,
      tags: ["gold", "necklace", "filigree", "wedding"],
      isFeatured: true,
      isBestSeller: true,
      averageRating: 4.9,
      reviewCount: 18,
      variants: {
        create: [
          { name: "16 inch", sku: "LUM-NCK-001-16", price: 78500, compareAtPrice: 89999, material: "Gold (22K)", size: "16 inch", weight: "18.5g" }
        ]
      }
    },
    include: { variants: true }
  });

  const prod3 = await prisma.product.create({
    data: {
      name: "Rose Petal Earrings",
      slug: "rose-petal-earrings",
      description: "Delicate rose gold drop earrings inspired by blooming petals. Featuring micro-pavé diamonds.",
      shortDescription: "Rose gold drop earrings with micro-pavé diamonds",
      price: 28999,
      costPrice: 18500,
      sku: "LUM-EAR-001",
      material: "Rose Gold",
      weight: "6.4g",
      purity: "750",
      categoryId: catEarrings.id,
      tags: ["rose gold", "earrings", "diamond", "drop"],
      isNewArrival: true,
      averageRating: 4.7,
      reviewCount: 31,
      variants: {
        create: [
          { name: "Standard", sku: "LUM-EAR-001-STD", price: 28999, material: "Rose Gold", weight: "6.4g" }
        ]
      }
    },
    include: { variants: true }
  });

  const prod4 = await prisma.product.create({
    data: {
      name: "Eternal Knot Bracelet",
      slug: "eternal-knot-bracelet",
      description: "A stunning 18K white gold bracelet featuring an eternal knot design, symbolizing everlasting love.",
      shortDescription: "18K White Gold eternal knot diamond bracelet",
      price: 62000,
      compareAtPrice: 72000,
      costPrice: 42000,
      sku: "LUM-BRC-001",
      material: "White Gold",
      weight: "12.8g",
      purity: "750",
      categoryId: catBracelets.id,
      tags: ["white gold", "bracelet", "diamond", "knot"],
      isFeatured: true,
      isNewArrival: true,
      averageRating: 4.6,
      reviewCount: 12,
      variants: {
        create: [
          { name: "Medium (7\")", sku: "LUM-BRC-001-M", price: 62000, compareAtPrice: 72000, material: "White Gold", size: "7 inch", weight: "12.8g" }
        ]
      }
    },
    include: { variants: true }
  });

  // 5. Create Inventory for all variants
  const allProducts = [prod1, prod2, prod3, prod4];
  
  for (const product of allProducts) {
    for (const variant of product.variants) {
      await prisma.inventory.create({
        data: {
          variantId: variant.id,
          warehouseId: warehouse.id,
          quantity: Math.floor(Math.random() * 20) + 5, // random stock between 5 and 25
          lowStockThreshold: 5
        }
      });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
