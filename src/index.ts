import { chromium } from "playwright";
import { Action, ScrapingStrategy } from "./types";
import { USER_AGENTS } from "./utils/browser-config";

export class Scraper<T> {
  url: string;
  strategy: ScrapingStrategy<T>;
  actions: Action[] | undefined;

  constructor(url: string, strategy: ScrapingStrategy<T>, actions?: Action[]) {
    this.url = url;
    this.strategy = strategy;
    this.actions = actions;
  }

  async run(): Promise<T> {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)], // Picks a random user agent
    });
    const page = await context.newPage();
    await page.goto(this.url);
    if (this.actions) {
      for (let action of this.actions) {
        await action.execute(page, context);
      }
    }
    const result = await this.strategy.execute(page);
    await browser.close();
    return result;
  }
}
