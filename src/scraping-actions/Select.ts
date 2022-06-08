import { BrowserContext, Page } from "playwright";
import { Action, ActionOptions } from "../types";
import { delay, validateOptions } from "../utils/utils";

type SelectOptions = {
  [P in keyof ActionOptions as Exclude<P, "cookie">]-?: ActionOptions[P];
};
export class Select implements Action {
  options: SelectOptions;

  constructor(options: SelectOptions) {
    validateOptions(options, {
      element: "Select action requires an element to select",
      value: "Select action requires a value to select",
    });
    this.options = options;
  }

  async execute(page: Page, _context?: BrowserContext): Promise<void> {
    await page.selectOption(
      this.options.element as string,
      this.options.value as string
    );
    await delay(100);
  }
}
