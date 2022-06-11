import { Browser, BrowserContext, Page } from "playwright";

export interface Command {
  execute(): void;
}

export interface ScrapingStrategy<T> {
  execute(page: Page): T;
}

export type ActionType =
  | "click"
  | "type"
  | "scroll"
  | "select"
  | "wait"
  | "cookie";

export type ActionOptions = {
  element?: string | undefined;
  value?: string | undefined;
  cookies?: Parameters<BrowserContext["addCookies"]>[0] | undefined;
};

export interface Action {
  options: ActionOptions;
  execute(page: Page, context?: BrowserContext): void;
}

export type PlaywrightBlocks = [Browser, BrowserContext, Page];
