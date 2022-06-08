import { chromium, Page } from "playwright";
import { ActionHandler } from "./ActionHandler";
import { ActionObj, ScrapingStrategy } from "./types";
import { USER_AGENTS } from "./utils/browser-config";

export class Scraper<T> {
  url: string;
  strategy: ScrapingStrategy<T>;
  actions: ActionObj[] | undefined;

  constructor(
    url: string,
    strategy: ScrapingStrategy<T>,
    actions?: ActionObj[]
  ) {
    this.url = url;
    this.strategy = strategy;
    this.actions = actions;
  }

  async run(): Promise<T> {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)], // Picks a random user agent
    });
    const page: Page = await context.newPage();
    await page.goto(this.url);
    if (this.actions) {
      for (let action of this.actions) {
        const actionHandler = new ActionHandler(
          action.type,
          action.options,
          page,
          context
        );
        actionHandler.execute();
      }
    }
    const result = await this.strategy.execute(page);
    await browser.close();
    return result;
  }
}
