import { Cookie, Page } from "playwright-core";

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
  element?: string;
  value?: string;
  cookie?: Cookie;
};

export type ActionObj = {
  type: ActionType;
  options: ActionOptions;
};
