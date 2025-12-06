import * as fs from "fs";
import * as path from "path";
import { Product } from "./pageScraper";

function ensureDataDirectory(): string {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  return dataDir;
}

function getTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/:/g, "-").split(".")[0];
}

export function exportToJSON(products: Product[]): void {
  const dataDir = ensureDataDirectory();
  const timestamp = getTimestamp();
  const fileName = `products_${timestamp}.json`;
  const filePath = path.join(dataDir, fileName);

  fs.writeFileSync(filePath, JSON.stringify(products, null, 2), "utf-8");
  console.log(`\nDados salvos no arquivo .json: ${filePath}`);
}

function escapeCSVValue(value: string): string {
  if (!value) return "";
  
  const stringValue = String(value);
  const needsQuotes = stringValue.includes(",") || 
                      stringValue.includes("\n") || 
                      stringValue.includes('"');
  
  if (needsQuotes) {
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  
  return stringValue;
}

export function exportToCSV(products: Product[]): void {
  const dataDir = ensureDataDirectory();
  const timestamp = getTimestamp();
  const fileName = `products_${timestamp}.csv`;
  const filePath = path.join(dataDir, fileName);

  const headers = [
    "title",
    "price",
    "paymentConditions",
    "brand",
    "color",
    "material",
    "capacity",
    "dimensions",
    "specialFeatures",
    "url"
  ];

  const rows = products.map((product) => {
    return headers
      .map((header) => {
        const value = product[header as keyof Product] || "";
        return escapeCSVValue(String(value));
      })
      .join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");

  fs.writeFileSync(filePath, csvContent, "utf-8");
  console.log(`\nDados salvos no arquivo .csv: ${filePath}`);
}