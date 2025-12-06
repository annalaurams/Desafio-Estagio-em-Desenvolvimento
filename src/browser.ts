import puppeteer, { Browser } from "puppeteer";

export async function startBrowser(): Promise<Browser | undefined> {
  let browser: Browser | undefined;

  try {
    console.log("Opening the browser...");
    browser = await puppeteer.launch({
      headless: false, // depois você pode trocar pra true
      args: ["--disable-setuid-sandbox"]
    });
  } catch (err) {
    console.error("Could not create a browser instance: ", err);
  }

  return browser;
}
