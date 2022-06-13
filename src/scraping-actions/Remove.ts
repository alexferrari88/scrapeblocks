import { BrowserContext, Page } from "playwright";
import { Action, ActionOptions } from "../types";
import { delay, validateOptions } from "../utils/utils";

type RemoveOptions = {
	[P in keyof ActionOptions as Exclude<P, "cookies" | "value">]-?: ActionOptions[P];
};
export class Remove implements Action {
	options: RemoveOptions;

	constructor(options: RemoveOptions) {
		validateOptions(options, {
			element: "Remove action requires an element to remove",
		});
		this.options = options;
	}

	async execute(page: Page, _context?: BrowserContext): Promise<void> {
		await page.$$eval(this.options.element, (elements) => {
			elements.forEach((element) => {
				element.remove();
			});
		});
		await delay(100);
	}
}
