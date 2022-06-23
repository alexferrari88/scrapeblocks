﻿import { Page } from "playwright";
import { Action, Hook, ScrapingStrategy } from "../types";
import { BaseStrategy } from "./BaseStrategy";

export class TextContentScraping extends BaseStrategy implements ScrapingStrategy<string[]> {
	url?: string;
	selector: string;
	preActions?: Action[];
	postActions?: Action[];
	hooks?: Hook[];

	constructor(options: {
		url?: string;
		selector: string;
		nextPageSelector?: string | ((page: Page) => Promise<void> | void);
		preActions?: Action[];
		postActions?: Action[];
		hooks?: Hook[];
	}) {
		super({
			preActions: options?.preActions,
			postActions: options?.postActions,
			hooks: options?.hooks,
		});
		this.url = options?.url;
		this.selector = options.selector;
	}

	async *execute(page: Page): AsyncGenerator<string[], string[] | undefined, string[]> {
		if (this.hooks) await this.runHooks(this.hooks, "beforeInStrategy", page);
		if (this.preActions) {
			for (const action of this.preActions) {
				action.execute(page);
			}
		}
		let result: string[] = [];
		result = await page.locator(this.selector).allTextContents();
		if (!this.nextPageSelector) {
			if (this.hooks) await this.runHooks(this.hooks, "afterInStrategy", page);
			return result;
		}
		let hasNextPage = true;
		while (hasNextPage) {
			try {
				if (typeof this.nextPageSelector === "string") {
					await page.click(this.nextPageSelector, { timeout: 5000 });
					await page.waitForSelector(this.selector);
				} else if (typeof this.nextPageSelector === "function") {
					await this.nextPageSelector(page);
				}
			} catch (error) {
				hasNextPage = false;
			}
			yield await page.locator(this.selector).allTextContents();
		}
		if (this.hooks) await this.runHooks(this.hooks, "afterInStrategy", page);
	}
}
