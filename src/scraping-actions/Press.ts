import { BrowserContext, Page } from "playwright";
import { Action, ActionOptions } from "../types";
import { delay, validateOptions } from "../utils/utils";

type PressOptions = {
  [P in keyof ActionOptions as Exclude<P, "cookies">]-?: ActionOptions[P];
};
export class Press implements Action {
  options: PressOptions;

  constructor(options: PressOptions) {
    validateOptions(options, {
      element: "Press action requires an element to press the key in",
      value: "Press action requires a value to press",
    });
    this.options = options;
  }

  async execute(page: Page, _context?: BrowserContext): Promise<void> {
    await page.press(this.options.element, this.options.value);
    await delay(100);
  }
}
