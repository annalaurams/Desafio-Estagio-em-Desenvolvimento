import { Browser } from "puppeteer";
import {
  openBestsellersPage,
  extractTopProducts,
  enrichProductWithDetails,
  Product
} from "./pageScraper";

import fs from "node:fs/promises";
import path from "node:path";

export default async function scraperController(
  browserPromise: Promise<Browser | undefined>
) {
  const browser = await browserPromise;

  if (!browser) {
    console.error("Browser instance not available.");
    return;
  }

  let page;
  try {
    page = await openBestsellersPage(browser);

    const basicProducts: Product[] = await extractTopProducts(
      page,
      3,
      "Mais Vendidos em Cozinha"
    );

    const detailedProducts: Product[] = [];
    for (const product of basicProducts) {
      const enriched = await enrichProductWithDetails(browser, product);
      detailedProducts.push(enriched);
    }

    console.log("\nProdutos extraídos:");
    console.dir(detailedProducts, { depth: null });

    await saveAsJson(detailedProducts);
    await saveAsCsv(detailedProducts);

    console.log("\nArquivos gerados em ./data/products.json e ./data/products.csv\n");
    console.log("Fim da extração!")
  } catch (error) {
    console.error("Erro durante a execução do scraper:", (error as Error).message);
  } finally {
    if (page) {
      await page.close();
    }
    await browser.close();
  }
}


async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  await fs.mkdir(dataDir, { recursive: true });
  return dataDir;
}

const HEADERS = [
  "title",
  "price",
  "url",
  "paymentConditions",
  "brand",
  "color",
  "material",
  "capacity",
  "dimensions",
  "specialFeatures"
] as const;

type HeaderKey = (typeof HEADERS)[number];

function normalizeProduct(p: Product): Record<HeaderKey, string> {
  return {
    title: p.title ?? "",
    price: p.price ?? "",
    url: p.url ?? "",
    paymentConditions: p.paymentConditions ?? "",
    brand: p.brand ?? "",
    color: p.color ?? "",
    material: p.material ?? "",
    capacity: p.capacity ?? "",
    dimensions: p.dimensions ?? "",
    specialFeatures: p.specialFeatures ?? ""
  };
}

async function saveAsJson(products: Product[]) {
  const dataDir = await ensureDataDir();
  const jsonPath = path.join(dataDir, "products.json");

  const normalized = products.map((p) => normalizeProduct(p));
  await fs.writeFile(jsonPath, JSON.stringify(normalized, null, 2), "utf8");
}

function csvEscape(value: string): string {
  const needsQuote = /[",\r\n]/.test(value);
  let v = value.replace(/"/g, '""'); // " -> ""
  if (needsQuote) {
    v = `"${v}"`;
  }
  return v;
}

function toCsv(products: Product[]): string {
  const lines: string[] = [];

  // Cabeçalho
  lines.push(HEADERS.join(",")); 

  for (const product of products) {
    const normalized = normalizeProduct(product);
    const row = HEADERS.map((key) => csvEscape(normalized[key])).join(",");
    lines.push(row);
  }

  return lines.join("\n");
}

async function saveAsCsv(products: Product[]) {
  const dataDir = await ensureDataDir();
  const csvPath = path.join(dataDir, "products.csv");
  const csvContent = toCsv(products);
  await fs.writeFile(csvPath, csvContent, "utf8");
}
