import { Browser, BrowserContext, chromium, Page } from "playwright";
import { Action, Hook, hookPointType, ScrapingStrategy } from "./types";
import { USER_AGENTS } from "./utils/browser-config";

class Scraper<R> {
	browser: Browser | undefined;
	context: BrowserContext | undefined;
	page: Page | undefined;
	url: string;
	strategies?: [...ScrapingStrategy<unknown>[], ScrapingStrategy<R>] | ScrapingStrategy<R>[];
	actions: Action[] | undefined;
	hooks: Hook[] | undefined;

	constructor(
		url: string,
		strategies?: [...ScrapingStrategy<unknown>[], ScrapingStrategy<R>] | ScrapingStrategy<R>[],
		actions?: Action[],
		hooks?: Hook[]
	) {
		this.url = url;
		this.actions = actions;
		this.strategies = strategies;
		this.hooks = hooks;
	}

	withBrowser(browser: Browser): Scraper<R> {
		this.browser = browser;
		return this;
	}

	withContext(context: BrowserContext): Scraper<R> {
		this.context = context;
		return this;
	}

	withPage(page: Page): Scraper<R> {
		this.page = page;
		return this;
	}

	async #runHooks(hookPoint: hookPointType, page?: Page, context?: BrowserContext): Promise<void> {
		if (!this.hooks) return;
		this.hooks.forEach(async (hook) => {
			if (hook.hookPoint === hookPoint) {
				await hook.execute(page, context);
			}
		});
	}

	async #cleanup(): Promise<void> {
		if (this.browser) {
			await this.#runHooks("beforeBrowserClose", this.page, this.context);
			await this.browser.close();
			await this.#runHooks("afterBrowserClose", this.page, this.context);
		}
	}

	async run(): Promise<R> {
		await this.#runHooks("start", this.page, this.context);
		if (!this.browser && !this.context && !this.page) {
			await this.#runHooks("beforeBrowserLaunch", this.page, this.context);
			this.browser = await chromium.launch();
			await this.#runHooks("afterBrowserLaunch", this.page, this.context);
		}
		if (!this.context && !this.page) {
			await this.#runHooks("beforeNewContext", this.page, this.context);
			this.context = await (this.browser as Browser).newContext({
				userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)], // Picks a random user agent
			});
			await this.#runHooks("afterNewContext", this.page, this.context);
		}
		if (!this.page) {
			await this.#runHooks("beforeNewPage", this.page, this.context);
			this.page = await (this.context as BrowserContext).newPage();
			await this.#runHooks("afterNewPage", this.page, this.context);
		}
		if (!this.url) throw new Error("URL is required");
		try {
			await this.#runHooks("beforeGoTo", this.page, this.context);
			if (this.url) await this.page.goto(this.url);
			await this.#runHooks("afterGoTo", this.page, this.context);
		} catch (error) {
			await this.#cleanup();
			throw error;
		}
		if (this.actions) {
			for (let action of this.actions) {
				try {
					await action.execute(this.page, this.context);
				} catch (error) {
					await this.#cleanup();
					throw error;
				}
			}
		}
		// No strategy provided, just execute the
		// actions and return the PlaywrightBlocks
		if (!this?.strategies) {
			await this.#runHooks("end", this.page, this.context);
			return {
				browser: this.browser as Browser,
				context: this.context as BrowserContext,
				page: this.page,
			} as unknown as R;
		}

		let result;
		for (const strategy of this.strategies) {
			try {
				await this.#runHooks("beforeStrategyExecution", this.page, this.context);
				result = await strategy.execute(this.page, result);
				await this.#runHooks("afterStrategyExecution", this.page, this.context);
			} catch (error) {
				await this.#cleanup();
				throw error;
			}
		}
		this.#cleanup();
		await this.#runHooks("end", this.page, this.context);
		return result as R;
	}
}

export * as ScrapingAction from "./scraping-actions";
export * as ScrapingStrategies from "./scraping-strategies";
export { Scraper };
