import { Browser, BrowserContext, chromium, Page } from "playwright";
import { Action, PlaywrightBlocks, ScrapingStrategy } from "./types";
import { USER_AGENTS } from "./utils/browser-config";

class Scraper<T> {
  browser: Browser | undefined;
  context: BrowserContext | undefined;
  page: Page | undefined;
  url: string;
  strategy?: ScrapingStrategy<T>;
  actions: Action[] | undefined;

  constructor(url: string, strategy?: ScrapingStrategy<T>, actions?: Action[]) {
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

  async run(): Promise<T | PlaywrightBlocks> {
    if (!this.browser && !this.context && !this.page)
      this.browser = await chromium.launch();
    if (!this.context && !this.page)
      this.context = await (this.browser as Browser).newContext({
        userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)], // Picks a random user agent
      });
    if (!this.page)
      this.page = await (this.context as BrowserContext).newPage();
    if (!this.url) throw new Error("URL is required");
    try {
      if (this.url) await this.page.goto(this.url);
    } catch (error) {
      await this.browser?.close();
      throw error;
    }
    if (this.actions) {
      for (let action of this.actions) {
        try {
          await action.execute(this.page, this.context);
        } catch (error) {
          await this.browser?.close();
          throw error;
        }
      }
    }
    // When not passing a strategy, make sure to
    // instanciate the Scraper like this:
    // new Scraper<PlaywrightBlocks>
    if (!this?.strategy)
      return [
        this.browser as Browser,
        this.context as BrowserContext,
        this.page as Page,
      ];
    let result: T;
    try {
      result = await this.strategy.execute(this.page);
    } catch (error) {
      await this.browser?.close();
      throw error;
    }
    if (this.browser) await this.browser.close();
    return result;
  }
}

export * as ScrapingAction from "./scraping-actions";
export * as ScrapingStrategies from "./scraping-strategies";
export { Scraper };
