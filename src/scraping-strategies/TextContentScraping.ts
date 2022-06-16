import { Page } from "playwright";
import { ScrapingStrategy } from "../types";
import { BaseStrategy } from "./BaseStrategy";

export class TextContentScraping
	extends BaseStrategy
	implements ScrapingStrategy<Promise<string[] | null>>
{
	selector: string;
	constructor(selector: string) {
		super();
		this.selector = selector;
	}

	async execute(page: Page): Promise<string[] | null> {
		if (this.hooks) await this.runHooks(this.hooks, "beforeInStrategy", page);
		const result = await page.locator(this.selector).allTextContents();
		if (this.hooks) await this.runHooks(this.hooks, "afterInStrategy", page);
		return result;
	}
}
