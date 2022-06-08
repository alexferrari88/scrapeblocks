import { BrowserContext, Cookie, Page } from "playwright";
import { ActionOptions, ActionType, Command } from "./types";
import { delay } from "./utils/utils";

export class ActionHandler implements Command {
  type: ActionType;
  options: ActionOptions;
  page: Page | undefined;
  context: BrowserContext | undefined;

  constructor(
    type: ActionType,
    options: ActionOptions,
    page?: Page,
    context?: BrowserContext
  ) {
    this.type = type;
    this.options = options;
    this.page = page;
    this.context = context;
  }

  async execute(): Promise<void> {
    if (
      this.page &&
      (this.type == "click" ||
        this.type == "type" ||
        this.type == "scroll" ||
        this.type == "select")
    ) {
      switch (this.type) {
        case "click":
          await this.page.click(this.options.element as string);
          await delay(100);
          break;
        case "type":
          await this.page.type(
            this.options.element as string,
            this.options.value as string
          );
          await delay(100);
          break;
        case "scroll":
          await this.page.evaluate(() =>
            window.scrollTo(0, document.body.scrollHeight)
          );
          await delay(100);
          break;
        case "select":
          await this.page.selectOption(
            this.options.element as string,
            this.options.value as string
          );
          await delay(100);
          break;
      }
    } else if (this.context && this.type == "cookie") {
      await this.context.addCookies([this.options.cookie as Cookie]);
    } else if (this.type == "wait") {
      await delay(parseInt(this.options.value as string));
    }
  }
}
