import { EventEmitter } from "events";
import { Page, Response } from "playwright";
import { Hook, ScrapingStrategy } from "../types";
import { BaseStrategy } from "./BaseStrategy";

type ResponseFilter = (respone: Response) => boolean;

export class GetResponsesStrategy
	extends BaseStrategy
	implements ScrapingStrategy<Promise<Response | null>>
{
	filter: ResponseFilter | undefined;
	hooks: Hook[];
	results: Response[] = [];
	constructor(eventsManager: EventEmitter, filter?: ResponseFilter, hooks?: Hook[]) {
		super(undefined, undefined, eventsManager);
		this.filter = filter;
		this.hooks = [
			{
				hookPoint: "afterNewPage",
				execute: async () => {
					(this.eventsManager as EventEmitter).on("response", async (response) => {
						if (response) this.results.push(response);
					});
				},
			},
			{
				hookPoint: "afterNewPage",
				execute: async (page: Page) => {
					page.on("response", async (response) => {
						if (!response) return;
						if (this.filter && !this.filter(response)) return;
						if (!this.filter || this.filter(response)) {
							this.results.push(response);
							test(this.eventsManager as EventEmitter).emit("response", response);
						}
					});
				},
			},
		];
		if (hooks) this.hooks.concat(hooks);
	}

	async execute(page: Page): Promise<Response | null> {
		if (this.hooks) await this.runHooks(this.hooks, "beforeInStrategy", page);
		if (!this.eventsManager) return null;
		const result = this.eventsManager.on("response", (response) => response);
		if (this.hooks) await this.runHooks(this.hooks, "afterInStrategy", page);
		return result;
	}
}
