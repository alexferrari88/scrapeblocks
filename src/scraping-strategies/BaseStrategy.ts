import { EventEmitter } from "events";
import { BrowserContext, Page } from "playwright";
import { Action, Hook, hookPointType } from "../types";
export abstract class BaseStrategy {
	actions: Action[] | undefined;
	hooks: Hook[] | undefined;
	eventsManager: EventEmitter | undefined;
	constructor(actions?: Action[], hooks?: Hook[], eventsManager?: EventEmitter) {
		this.actions = actions;
		this.hooks = hooks;
		this.eventsManager = eventsManager;
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
