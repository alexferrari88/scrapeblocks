import { BrowserContext, Page } from "playwright";
import { Action, ActionOptions } from "../types";
import { delay, validateOptions } from "../utils/utils";

type ClickOptions = {
  [P in keyof ActionOptions as Exclude<
    P,
    "cookie" | "value"
  >]-?: ActionOptions[P];
};
export class Click implements Action {
  options: ClickOptions;

  constructor(options: ClickOptions) {
    validateOptions(options, {
      element: "Click action requires an element to click",
    });
    this.options = options;
  }

  async execute(page: Page, _context?: BrowserContext): Promise<void> {
    await page.click(this.options.element);
    await delay(100);
  }
}
