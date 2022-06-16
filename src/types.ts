import { Browser, BrowserContext, Page } from "playwright";

export type Last<T extends readonly any[]> = T extends readonly [...any[], infer R] ? R : never;

export interface Command {
	execute(): void;
}

export interface ScrapingStrategy<R = Promise<void>> {
	actions: Action[] | undefined;
	hooks: Hook[] | undefined;
	execute(page: Page, input?: unknown): R;
}

export type ActionType = "click" | "type" | "scroll" | "select" | "wait" | "cookie";

export type ActionOptions = {
	element?: string | undefined;
	value?: string | undefined;
	cookies?: Parameters<BrowserContext["addCookies"]>[0] | undefined;
};

export interface Action {
	options: ActionOptions;
	execute(page: Page, context?: BrowserContext): void;
}

export type hookPointType =
	| "start"
	| "beforeBrowserLaunch"
	| "afterBrowserLaunch"
	| "beforeNewContext"
	| "afterNewContext"
	| "beforeNewPage"
	| "afterNewPage"
	| "beforeGoTo"
	| "afterGoTo"
	| "beforeActions"
	| "afterActions"
	| "beforeStrategyExecution"
	| "beforeInStrategy"
	| "afterInStrategy"
	| "afterStrategyExecution"
	| "beforeBrowserClose"
	| "afterBrowserClose"
	| "end";

export type Hook = {
	hookPoint: hookPointType;
	execute(page?: Page, context?: BrowserContext): void;
};

export type PlaywrightBlocks = {
	browser: Browser;
	context: BrowserContext;
	page: Page;
};
