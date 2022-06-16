import { Page } from "playwright";
import { ScrapingStrategy } from "../types";

const parseJSON = (json: string) => {
	try {
		return JSON.parse(json);
	} catch (e) {
		return null;
	}
};

export class AllJSONs implements ScrapingStrategy<U> {
	withUrls: boolean = false;
	#result: U[];
	constructor(withUrls?: boolean) {
		this.withUrls = withUrls || this.withUrls;
	}

	async execute(page: Page): Promise<string[] | null> {
		return await page.locator(this.selector).allTextContents();
	}
}
