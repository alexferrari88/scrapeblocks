import { Browser, BrowserContext, chromium, Page } from "playwright";
import { Action, ScrapingStrategy } from "./types";
import { USER_AGENTS } from "./utils/browser-config";

export class Scraper<T> {
  browser: Browser | undefined;
  context: BrowserContext | undefined;
  page: Page | undefined;
  url: string;
  strategy: ScrapingStrategy<T>;
  actions: Action[] | undefined;

  constructor(url: string, strategy: ScrapingStrategy<T>, actions?: Action[]) {
    this.url = url;
    this.strategy = strategy;
    this.actions = actions;
  }

  withBrowser(browser: Browser): Scraper<T> {
    this.browser = browser;
    return this;
  }

  withContext(context: BrowserContext): Scraper<T> {
    this.context = context;
    return this;
  }

  withPage(page: Page): Scraper<T> {
    this.page = page;
    return this;
  }

  async run(): Promise<T> {
    if (!this.browser && !this.context && !this.page)
      this.browser = await chromium.launch();
    if (!this.context && !this.page)
      this.context = await (this.browser as Browser).newContext({
        userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)], // Picks a random user agent
      });
    if (!this.page)
      this.page = await (this.context as BrowserContext).newPage();
    if (this.url) await this.page.goto(this.url);
    if (this.actions) {
      for (let action of this.actions) {
        await action.execute(this.page, this.context);
      }
    }
    const result = await this.strategy.execute(this.page);
    if (this.browser) await this.browser.close();
    return result;
  }
}
