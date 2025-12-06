import { Browser } from "puppeteer";
import {
  openBestsellersPage,
  extractTopProducts,
  enrichProductWithDetails,
  Product
} from "./pageScraper";

export default async function scraperController(
  browserPromise: Promise<Browser | undefined>
) {
  const browser = await browserPromise;

  if (!browser) {
    console.error("Browser instance not available.");
    return;
  }

  try {
    // 1) Abre página de mais vendidos
    const page = await openBestsellersPage(browser);

    // 2) Extrai nome, preço e URL dos top 3 produtos
    const basicProducts: Product[] = await extractTopProducts(page, 3);

    // 3) Para cada produto, abre a página dele e pega condições de pagamento + specs
    const detailedProducts: Product[] = [];
    for (const product of basicProducts) {
      const enriched = await enrichProductWithDetails(browser, product);
      detailedProducts.push(enriched);
    }

    console.log("Produtos com detalhes:");
    console.dir(detailedProducts, { depth: null });
  } finally {
    await browser.close();
  }
}
