import { EventEmitter } from "events";
import { BrowserContext, Page } from "playwright";
import { Action, Hook, hookPointType } from "../types";

type BaseStrategyOptions = {
	preActions?: Action[];
	postActions?: Action[];
	hooks?: Hook[];
	eventsManager?: EventEmitter;
	nextPageSelector?: string;
};
export abstract class BaseStrategy {
	nextPageSelector?: string | ((page: Page) => Promise<void> | void);
	preActions?: Action[];
	postActions?: Action[];
	hooks?: Hook[];
	eventsManager: EventEmitter | undefined;

	constructor(options: BaseStrategyOptions) {
		this.eventsManager = options?.eventsManager;
		this.nextPageSelector = options?.nextPageSelector;
		this.preActions = options?.preActions;
		this.postActions = options?.postActions;
		this.hooks = options?.hooks;
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
