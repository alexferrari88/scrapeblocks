﻿import { Page } from "playwright";
import { Action, Hook, ScrapingStrategy } from "../types";
import { BaseStrategy } from "./BaseStrategy";

export class TextContentScraping extends BaseStrategy implements ScrapingStrategy<string[][]> {
	url?: string;
	selectors: string[];

	constructor(options: {
		url?: string;
		selectors: string[];
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
		this.selectors = options.selectors;
	}

	async *execute(page: Page): AsyncGenerator<string[][], string[][] | undefined, string[][]> {
		if (this.hooks) await this.runHooks(this.hooks, "beforeInStrategy", page);
		if (this.preActions) {
			for (const action of this.preActions) {
				action.execute(page);
			}
		}
		let result: string[][] = [];
		for (const selector of this.selectors) {
			const text = await page.locator(selector).allTextContents();
			result.push(text);
		}
		if (!this.nextPageSelector) {
			if (this.hooks) await this.runHooks(this.hooks, "afterInStrategy", page);
			return result;
		}
		let hasNextPage = true;
		while (hasNextPage) {
			try {
				if (typeof this.nextPageSelector === "string") {
					await page.click(this.nextPageSelector, { timeout: 5000 });
					await page.waitForSelector(this.selectors[0]);
				} else if (typeof this.nextPageSelector === "function") {
					await this.nextPageSelector(page);
				}
			} catch (error) {
				hasNextPage = false;
			}
			for (const selector of this.selectors) {
				const text = await page.locator(selector).allTextContents();
				result.push(text);
			}
			yield result;
		}
		if (this.hooks) await this.runHooks(this.hooks, "afterInStrategy", page);
	}
}
