import { BrowserContext, Page } from "playwright";
import { Action, Hook, hookPointType } from "../types";

export abstract class BaseStrategy {
	actions: Action[] | undefined;
	hooks: Hook[] | undefined;
	constructor(actions?: Action[], hooks?: Hook[]) {
		this.actions = actions;
		this.hooks = hooks;
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
