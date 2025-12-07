import { Browser, Page } from "puppeteer";

export interface Product {
  title: string;
  price: string;
  url: string;
  paymentConditions?: string;

  brand?: string;
  color?: string;
  material?: string;
  capacity?: string;
  dimensions?: string;
  specialFeatures?: string;
}

const BASE_URL = "https://www.amazon.com.br";
const BESTSELLERS_URL = `${BASE_URL}/bestsellers`;

async function preparePageForEvaluate(page: Page) {
  await page.evaluateOnNewDocument(() => {
    (globalThis as any).__name = (fn: any) => fn;
  });
}

export async function openBestsellersPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();

  await preparePageForEvaluate(page);

  console.log(`Site oficial: ${BESTSELLERS_URL}...`);

  await page.goto(BESTSELLERS_URL, {
    waitUntil: "networkidle2"
  });

  await page.waitForSelector("h2.a-carousel-heading");

  return page;
}

export async function extractTopProducts(
  page: Page,
  limit: number = 3,
  headingText: string = "Mais Vendidos em Cozinha"
): Promise<Product[]> {
  const products = await page.evaluate(
    (limit, baseUrl, headingText) => {
      const normalize = (t: string | null | undefined) =>
        (t || "").replace(/\s+/g, " ").trim();

      const headingEls = Array.from(
        document.querySelectorAll<HTMLHeadingElement>("h2.a-carousel-heading")
      );

      const heading = headingEls.find((h) =>
        normalize(h.textContent).includes(headingText)
      );

      let root: HTMLElement | Document = document;
      if (heading) {
        const section =
          heading.closest<HTMLElement>(".a-section") ??
          heading.parentElement ??
          heading;
        root = section;
      }

      const cards = Array.from(
        root.querySelectorAll<HTMLElement>("[data-asin]")
      ).filter((c) => !!c.getAttribute("data-asin"));

      const max = Math.min(cards.length, limit);
      const items: { title: string; price: string; url: string }[] = [];

      for (let i = 0; i < max; i++) {
        const card = cards[i];

        const titleEl =
          card.querySelector<HTMLElement>(
            "div.p13n-sc-truncate-desktop-type2"
          ) ||
          card.querySelector<HTMLElement>(
            "span.a-size-medium.a-color-base.a-text-normal"
          ) ||
          card.querySelector<HTMLElement>("img[alt]");

        let title = "";
        if (titleEl) {
          if (titleEl.tagName.toLowerCase() === "img") {
            title =
              (titleEl as HTMLImageElement).alt?.toString().trim() || "";
          } else {
            title = titleEl.textContent?.trim() || "";
          }
        }

        let price = "";

        const inlinePriceEl = card.querySelector<HTMLSpanElement>(
          "span._cDEzb_p13n-sc-price_3mJ9Z"
        );
        if (inlinePriceEl && inlinePriceEl.textContent) {
          price = inlinePriceEl.textContent
            .replace(/\s+/g, " ")
            .replace("\u00a0", " ") 
            .trim();
        }

        if (!price) {
          const symbolEl = card.querySelector<HTMLSpanElement>(
            "span.a-price-symbol"
          );
          const wholeEl = card.querySelector<HTMLSpanElement>(
            "span.a-price-whole"
          );
          const fractionEl = card.querySelector<HTMLSpanElement>(
            "span.a-price-fraction"
          );

          if (wholeEl) {
            const symbol = symbolEl?.textContent?.trim() || "R$";
            const wholeRaw = wholeEl.textContent || "";
            const whole = wholeRaw.replace(/\D/g, ""); // só dígitos
            const fractionRaw = (fractionEl?.textContent || "").trim();
            const fraction = fractionRaw.replace(/\D/g, "");

            if (whole) {
              price = `${symbol} ${whole}${fraction ? "," + fraction : ""}`;
            }
          }
        }

        if (!price) {
          const priceContainer =
            card.querySelector<HTMLElement>("span.a-price") ||
            card.querySelector<HTMLElement>("span.a-color-price");
          if (priceContainer) {
            const symbol =
              priceContainer
                .querySelector<HTMLElement>("span.a-price-symbol")
                ?.textContent?.trim() || "R$";
            const whole =
              priceContainer
                .querySelector<HTMLElement>("span.a-price-whole")
                ?.textContent?.replace(/[^\d]/g, "") || "";
            const fraction =
              priceContainer
                .querySelector<HTMLElement>("span.a-price-fraction")
                ?.textContent?.replace(/[^\d]/g, "") || "";

            if (whole) {
              price = `${symbol} ${whole}${fraction ? "," + fraction : ""}`;
            }
          }
        }

        const linkEl =
          card.querySelector<HTMLAnchorElement>(
            "a.a-link-normal[href*='/dp/'], a.a-link-normal[href*='/gp/']"
          ) ||
          card.querySelector<HTMLAnchorElement>("a.a-link-normal[href]");

        const href = linkEl?.getAttribute("href") || "";
        const url = href.startsWith("http") ? href : baseUrl + href;

        items.push({
          title,
          price,
          url
        });
      }

      return items;
    },
    limit,
    BASE_URL,
    headingText
  );

  return products as Product[];
}

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
    return null;
  }
}
export async function extractProductSpecs(
  page: Page
): Promise<Partial<Product>> {
  try {
    const specs = await page.$$eval("tr.a-spacing-small", (rows) => {
      const result: any = {};

      rows.forEach((row) => {
        const labelEl = row.querySelector(
          "td.a-span3 span.a-size-base.a-text-bold"
        );
        const valueEl = row.querySelector(
          "td.a-span9 span.a-size-base.po-break-word"
        );

        const label = labelEl?.textContent?.trim() || "";
        const value = valueEl?.textContent?.trim() || "";

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
    });

    return specs as Partial<Product>;
  } catch (err) {
    console.error("Erro ao extrair especificações:", (err as Error).message);
    return {};
  }
}

export async function enrichProductWithDetails(
  browser: Browser,
  product: Product
): Promise<Product> {
  if (!product.url) {
    return product;
  }

  const page = await browser.newPage();
  await preparePageForEvaluate(page);

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
      `Erro ao extrair produto "${product.title}":`,
      (error as Error).message
    );
    return product;
  } finally {
    await page.close();
  }
}
