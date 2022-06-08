import { BrowserContext, Cookie, Page } from "playwright-core";

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
  cookie?: Cookie | undefined;
};

export interface Action {
  options: ActionOptions;
  execute(page: Page, context: BrowserContext): void;
}
