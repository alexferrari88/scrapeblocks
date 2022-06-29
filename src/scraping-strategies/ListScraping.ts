import { Locator, Page } from "playwright";
import { Action, Hook, ScrapingStrategy } from "../types";
import { BaseStrategy } from "./BaseStrategy";

type ListScrapingItemDescriptorValues = {
	selector: string;
	attribute: "textContent" | "href";
};

export const makeListScrapingItemDescriptor = <
	T extends Record<string, ListScrapingItemDescriptorValues>
>(
	descriptor: T
): Record<keyof T, ListScrapingItemDescriptorValues> => descriptor;

const itemValueGetters = {
	textContent: async (item: Locator, selector: string) =>
		await item.locator(selector).allTextContents(),
	href: async (item: Locator, selector: string) => {
		const result = await item.locator(selector).getAttribute("href");
		if (result) return [result];
		return [""];
	},
};

export class ListScraping<T extends string>
	extends BaseStrategy
	implements ScrapingStrategy<Record<string, string[]>>
{
	url?: string;
	groupSelector: string;
	itemDescriptor: Record<T, ListScrapingItemDescriptorValues>;

	constructor(options: {
		url?: string;
		groupSelector: string;
		itemDescriptor: Record<T, ListScrapingItemDescriptorValues>;
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

	async *execute(options: {
		page?: Page;
		input?: string | string[];
	}): AsyncIterable<Record<T, string[]>> {
		let page = options?.page;
		if (this.hooks) await this.runHooks(this.hooks, "beforeInStrategy", page);
		if (!page && this.url) {
			await this.createPageFromUrl(this.url);
			page = this.page;
		}
		this.assertUrlAndPage(page);
		if (this.preActions) {
			for await (const action of this.preActions) {
				action.execute(page);
			}
		}
		let hasNextPage = true;
		while (hasNextPage) {
			const groups = page.locator(this.groupSelector);
			const nGroups = await groups.count();
			for (let i = 0; i < nGroups; i++) {
				const item = groups.nth(i);
				const itemResult = {} as { [key in T]: string[] };
				for (const [key, values] of Object.entries(this.itemDescriptor)) {
					const selector = (values as ListScrapingItemDescriptorValues).selector;
					const value = await itemValueGetters[
						(values as ListScrapingItemDescriptorValues).attribute
					](item, selector);
					itemResult[key as T] = value;
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
