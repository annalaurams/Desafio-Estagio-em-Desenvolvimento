import puppeteer, { Browser } from "puppeteer";

export async function startBrowser(): Promise<Browser | undefined> {
  let browser: Browser | undefined;

  try {
    console.log("\nAbrindo browser.. aguarde!");
    browser = await puppeteer.launch({
      headless: false, 
      args: ["--disable-setuid-sandbox", "--no-sandbox"]
    });
  } catch (err) {
    console.error("\nNão foi possível criar uma instância do navegador.: ", err);
  }

  return browser;
}
