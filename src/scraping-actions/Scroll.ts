import { BrowserContext, Page } from "playwright";
import { Action, ActionOptions } from "../types";
import { delay } from "../utils/utils";

export class Scroll implements Action {
  options: ActionOptions;

  constructor(options: ActionOptions) {
    this.options = options;
  }

  async execute(page: Page, _context?: BrowserContext): Promise<void> {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await delay(100);
  }
}
