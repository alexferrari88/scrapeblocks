import { BrowserContext, Page } from "playwright";
import { Action, ActionOptions } from "../types";
import { delay, validateOptions } from "../utils/utils";

type WaitOptions = {
  [P in keyof ActionOptions as Exclude<
    P,
    "element" | "cookies"
  >]-?: ActionOptions[P];
};
export class Wait implements Action {
  options: WaitOptions;

  constructor(options: WaitOptions) {
    validateOptions(options, {
      value: "Wait action requires a value (in ms) to wait",
    });
    this.options = options;
  }

  async execute(_page: Page, _context: BrowserContext): Promise<void> {
    await delay(parseInt(this.options.value));
    await delay(100);
  }
}
