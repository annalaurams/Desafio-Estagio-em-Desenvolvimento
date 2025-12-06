import { startBrowser } from "./browser";
import scraperController from "./pageController";

async function run() {
  const browserInstance = startBrowser();
  await scraperController(browserInstance);
}

run();
