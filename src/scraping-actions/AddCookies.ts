import { BrowserContext, Page } from "playwright";
import { Action, ActionOptions } from "../types";
import { delay, validateOptions } from "../utils/utils";

type CookieOptions = {
  [P in keyof ActionOptions as Exclude<
    P,
    "element" | "value"
  >]-?: ActionOptions[P];
};
export class AddCookies implements Action {
  options: CookieOptions;

  constructor(options: CookieOptions) {
    validateOptions(options, {
      cookies: "Cookie action requires a cookie to add",
    });
    this.options = options;
  }

  async execute(_page: Page, context: BrowserContext): Promise<void> {
    await context.addCookies(this.options.cookies);
    await delay(100);
  }
}
