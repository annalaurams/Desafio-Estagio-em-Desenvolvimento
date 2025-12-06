import puppeteer, { Browser } from "puppeteer";

export async function startBrowser(): Promise<Browser | undefined> {
  let browser: Browser | undefined;

  try {
    console.log("Abrindo browser...");
    browser = await puppeteer.launch({
      headless: false, 
      args: ["--disable-setuid-sandbox", "--no-sandbox"]
    });
  } catch (err) {
    console.error("Could not create a browser instance: ", err);
  }

  return browser;
}
