import { Browser, BrowserContext, Locator, Page } from "playwright";
import { Action, Hook, ScrapingStrategy } from "../types";
import { BaseStrategy } from "./BaseStrategy";

type ListScrapingItemDescriptor = Record<
	string,
	{
		selector: string;
		attribute: "textContent" | "href";
	}
>;

const itemValueGetters = {
	textContent: async (item: Locator, selector: string) =>
		await item.locator(selector).allTextContents(),
	href: async (item: Locator, selector: string) => {
		const result = await item.locator(selector).getAttribute("href");
		if (result) return [result];
		return [""];
	},
};

export class ListScraping
	extends BaseStrategy
	implements ScrapingStrategy<Record<string, string | string[]>>
{
	url?: string;
	groupSelector: string;
	itemDescriptor: ListScrapingItemDescriptor;

	constructor(options: {
		url?: string;
		groupSelector: string;
		itemDescriptor: ListScrapingItemDescriptor;
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
		this.groupSelector = options.groupSelector;
		this.itemDescriptor = options.itemDescriptor;
	}

	async *execute(
		page?: Page
	): AsyncGenerator<
		Record<string, string | string[]>,
		Record<string, string | string[]> | undefined,
		Record<string, string | string[]>
	> {
		if (this.hooks) await this.runHooks(this.hooks, "beforeInStrategy", page);
		let browser: Browser;
		let context: BrowserContext;
		if (!page && this.url) {
			await this.createPageFromUrl(this.url);
			page = this.page;
		}
		this.assertUrlAndPage(page);
		if (this.preActions) {
			for (const action of this.preActions) {
				action.execute(page);
			}
		}
		let hasNextPage = true;
		while (hasNextPage) {
			const groups = await page.locator(this.groupSelector);
			const nGroups = await groups.count();
			for (let i = 0; i < nGroups; i++) {
				const item = groups.nth(i);
				const itemResult: Record<string, string | string[]> = {};
				for (const [key, values] of Object.entries(this.itemDescriptor)) {
					const selector = values.selector;
					const value = await itemValueGetters[values.attribute](item, selector);
					itemResult[key] = value;
				}
				yield itemResult;
			}
			if (!this.nextPageSelector) break;
			try {
				if (typeof this.nextPageSelector === "string") {
					await page.click(this.nextPageSelector, { timeout: 5000 });
					await page.waitForLoadState();
				} else if (typeof this.nextPageSelector === "function") {
					await this.nextPageSelector(page);
				}
			} catch (error) {
				hasNextPage = false;
			}
		}
		if (this.hooks) await this.runHooks(this.hooks, "afterInStrategy", page);
		this.cleanup();
		return;
	}

	private assertUrlAndPage(page?: Page): asserts page is Page {
		if (!page && !this.url) throw new Error("No url or page provided");
	}
}
