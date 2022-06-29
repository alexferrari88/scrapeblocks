import { Browser, BrowserContext, Page } from "playwright";
export interface Command {
	execute(): void;
}

export interface ScrapingStrategy<R = Promise<void>> {
	url?: string;
	nextPageSelector?: string | ((page: Page) => Promise<void> | void);
	preActions?: Action[];
	postActions?: Action[];
	hooks?: Hook[];
	// execute(page: Page, input?: unknown): R;
	execute(options: { page?: Page; input?: unknown }): AsyncIterable<R>;
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

export type Hook<R = void> = {
	hookPoint: hookPointType;
	execute(page?: Page, context?: BrowserContext): R;
};

export type PlaywrightBlocks = {
	browser: Browser;
	context: BrowserContext;
	page: Page;
};
