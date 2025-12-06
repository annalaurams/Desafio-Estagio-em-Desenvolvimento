import { Browser, Page } from "puppeteer";

export interface Product {
  title: string;
  price: string;
  url: string;
  paymentConditions?: string;

  // specs da página do produto
  brand?: string;
  color?: string;
  material?: string;
  capacity?: string;
  dimensions?: string;
  specialFeatures?: string;
}

const BASE_URL = "https://www.amazon.com.br";
const BESTSELLERS_URL = `${BASE_URL}/bestsellers`;

// 1) Abre a página de mais vendidos e espera carregar
export async function openBestsellersPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();

  console.log(`Navigating to ${BESTSELLERS_URL}...`);

  await page.goto(BESTSELLERS_URL, {
    waitUntil: "networkidle2"
  });

  // Garante que os cards de produto apareceram
  await page.waitForSelector("[data-asin]");

  return page;
}

// 2) Extrai os top N produtos da página de mais vendidos (nome, preço, url)
export async function extractTopProducts(
  page: Page,
  limit: number = 3
): Promise<Product[]> {
  const products = await page.$$eval(
    "[data-asin]", // cada card de produto tem esse atributo
    (cards, limit, baseUrl) => {
      const items: { title: string; price: string; url: string }[] = [];

      const cardArray = Array.from(cards as HTMLElement[]);
      const max = Math.min(cardArray.length, limit as number);

      for (let i = 0; i < max; i++) {
        const card = cardArray[i];

        const titleEl = card.querySelector(
          "div.p13n-sc-truncate-desktop-type2"
        );
        const priceEl = card.querySelector(
          "span._cDEzb_p13n-sc-price_3mJ9Z"
        );
        const linkEl = card.querySelector("a.a-link-normal");

        const href = linkEl?.getAttribute("href") || "";
        const url = href ? (baseUrl as string) + href : "";

        const title = titleEl?.textContent?.trim() || "";
        const price = priceEl?.textContent?.trim() || "";

        items.push({ title, price, url });
      }

      return items;
    },
    limit,
    BASE_URL
  );

  return products;
}

// 3) Dentro da página do produto, extrai só as condições de pagamento
export async function extractPaymentConditions(
  page: Page
): Promise<string | null> {
  try {
    const text = await page.$eval(
      "#best-offer-string-cc.best-offer-name",
      (el) => (el.textContent || "").trim()
    );

    return text || null;
  } catch {
    // Se não achar o elemento, retorna null sem quebrar
    return null;
  }
}

// 4) Extrai specs da tabelinha (marca, cor, material, etc.)
export async function extractProductSpecs(
  page: Page
): Promise<Partial<Product>> {
  try {
    const specs = await page.$$eval(
      "tr.a-spacing-small",
      (rows) => {
        const result: any = {};

        rows.forEach((row) => {
          const labelEl = row.querySelector(
            "td.a-span3 span.a-size-base.a-text-bold"
          );
          const valueEl = row.querySelector(
            "td.a-span9 span.a-size-base.po-break-word"
          );

          const label = labelEl?.textContent?.trim();
          const value = valueEl?.textContent?.trim();

          if (!label || !value) return;

          if (label.includes("Marca")) {
            result.brand = value;
          } else if (label.includes("Cor")) {
            result.color = value;
          } else if (label.includes("Material")) {
            result.material = value;
          } else if (label.includes("Capacidade")) {
            result.capacity = value;
          } else if (label.includes("Dimensões do produto")) {
            result.dimensions = value;
          } else if (label.includes("Características especiais")) {
            result.specialFeatures = value;
          }
        });

        return result;
      }
    );

    return specs as Partial<Product>;
  } catch (err) {
    console.error("Erro ao extrair especificações:", (err as Error).message);
    return {};
  }
}

// 5) Abre a página do produto e adiciona condições de pagamento + specs ao objeto
export async function enrichProductWithDetails(
  browser: Browser,
  product: Product
): Promise<Product> {
  if (!product.url) {
    return product;
  }

  const page = await browser.newPage();

  try {
    console.log(`Abrindo página do produto: ${product.title}`);
    await page.goto(product.url, {
      waitUntil: "networkidle2"
    });

    const paymentConditions = await extractPaymentConditions(page);
    const specs = await extractProductSpecs(page);

    return {
      ...product,
      paymentConditions: paymentConditions || "",
      ...specs
    };
  } catch (error) {
    console.error(
      `Erro ao enriquecer produto "${product.title}":`,
      (error as Error).message
    );
    return product;
  } finally {
    await page.close();
  }
}
