import { ScrapingStrategy } from "./types";

export class Pipeline<R> {
	steps: Step<unknown>[];
	constructor(steps: Step<unknown>[]) {
		this.steps = steps;
	}

	async run();
}

export class Step<R> {
	strategy: ScrapingStrategy<R> | undefined;
	inputs: Step<unknown>[] | undefined;

	setStrategy(strategy: ScrapingStrategy<R>) {
		this.strategy = strategy;
	}

	setInputs(inputs: Step<unknown>[]) {
		this.inputs = inputs;
	}
}
