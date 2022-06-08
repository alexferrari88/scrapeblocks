import { BrowserContext, Page } from "playwright";
import { Action, ActionOptions } from "../types";
import { delay, validateOptions } from "../utils/utils";

type TypeOptions = {
  [P in keyof ActionOptions as Exclude<P, "cookie">]-?: ActionOptions[P];
};
export class Type implements Action {
  options: TypeOptions;

  constructor(options: TypeOptions) {
    validateOptions(options, {
      element: "Type action requires an element to type in",
      value: "Type action requires a value to type",
    });
    this.options = options;
  }

  async execute(page: Page, _context?: BrowserContext): Promise<void> {
    await page.type(this.options.element, this.options.value);
    await delay(100);
  }
}
