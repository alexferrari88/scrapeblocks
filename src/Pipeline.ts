import { from, Observable } from "rxjs";
import { ScrapingStrategy } from "./types";

export class Pipeline<R> {
	steps: Step<unknown>[];
	constructor(steps: Step<unknown>[]) {
		this.steps = steps;
	}

	async run(): Promise<R> {
		let result: R;
		// build a pipeline of steps using rxjs
	}
}

export class Step<R> {
	strategy: ScrapingStrategy<R> | undefined;
	inputs: Step<unknown>[] | undefined;
	observable: Observable<R> | undefined;

	setStrategy(strategy: ScrapingStrategy<R>) {
		this.strategy = strategy;
	}

	setInputs(inputs: Step<unknown>[]) {
		this.inputs = inputs;
	}

	async run(): Promise<R> {
		if (!this.strategy) throw new Error("No strategy set");
		for await (const result of this.strategy.execute()) {
			this.observable = from(result);
		}
	}
}
