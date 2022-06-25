import { EventEmitter } from "events";
import { Browser, BrowserContext, chromium, Page } from "playwright";
import { Action, Hook, hookPointType } from "../types";

export abstract class BaseStrategy {
	nextPageSelector?: string | ((page: Page) => Promise<void> | void);
	preActions?: Action[];
	postActions?: Action[];
	hooks?: Hook[];
	browser?: Browser;
	context?: BrowserContext;
	page?: Page;

	constructor(options: {
		preActions?: Action[];
		postActions?: Action[];
		hooks?: Hook[];
		eventsManager?: EventEmitter;
		nextPageSelector?: string;
	}) {
		this.nextPageSelector = options?.nextPageSelector;
		this.preActions = options?.preActions;
		this.postActions = options?.postActions;
		this.hooks = options?.hooks;
	}

	protected async createPageFromUrl(url: string): Promise<void> {
		if (this.hooks) await this.runHooks(this.hooks, "beforeBrowserLaunch");
		this.browser = await chromium.launch();
		if (this.hooks) this.runHooks(this.hooks, "afterBrowserLaunch");
		if (this.hooks) await this.runHooks(this.hooks, "beforeNewContext");
		this.context = await this.browser.newContext();
		if (this.hooks) await this.runHooks(this.hooks, "afterNewContext", undefined, this.context);
		if (this.hooks) await this.runHooks(this.hooks, "beforeNewPage", undefined, this.context);
		this.page = await this.context.newPage();
		if (this.hooks) await this.runHooks(this.hooks, "afterNewPage", this.page, this.context);
		if (this.hooks) await this.runHooks(this.hooks, "beforeGoTo", this.page, this.context);
		try {
			await this.page.goto(url);
		} catch (error) {
			await this.cleanup();
			throw error;
		}
		if (this.hooks) await this.runHooks(this.hooks, "afterGoTo", this.page, this.context);
	}

	protected async cleanup(): Promise<void> {
		if (this.browser) {
			if (this.hooks)
				await this.runHooks(this.hooks, "beforeBrowserClose", this.page, this.context);
			await this.browser.close();
			if (this.hooks) await this.runHooks(this.hooks, "afterBrowserClose", this.page, this.context);
		}
	}

	protected async runHooks(
		hooks: Hook[],
		hookPoint: hookPointType,
		page?: Page,
		context?: BrowserContext
	): Promise<void> {
		if (!hooks) return;
		for (const hook of hooks) {
			if (hook.hookPoint === hookPoint) {
				await hook.execute(page, context);
			}
		}
	}
}
