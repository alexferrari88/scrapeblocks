import { from, Observable, Observer } from "rxjs";
import { ScrapingStrategy } from "./types";

export class Pipeline<StrategyOutput> {
	steps: Spider<unknown>[];
	constructor(steps: Spider<unknown>[]) {
		this.steps = steps;
	}
}

export class Spider<StrategyOutput, NextStrategyInput = StrategyOutput>
	implements Partial<Observer<NextStrategyInput>>
{
	next?: (value: NextStrategyInput) => void;
	error?: (err: any) => void;
	complete?: () => void;
	inputValues?: NextStrategyInput;
	strategy: ScrapingStrategy<StrategyOutput>;
	observable?: Observable<StrategyOutput>;
	observer?: Observer<StrategyOutput>;

	constructor(options: {
		strategy: ScrapingStrategy<StrategyOutput>;
		inputValues?: NextStrategyInput;
		next?: (value: NextStrategyInput) => void;
		error?: (err: any) => void;
		complete?: () => void;
	}) {
		this.strategy = options.strategy;
		this.inputValues = options.inputValues;
		this.next = options?.next;
		this.error = options?.error;
		this.complete = options?.complete;
	}

	async run(): Promise<StrategyOutput | StrategyOutput[] | void> {
		if (!this.strategy) throw new Error("No strategy set");
		const generator = this.strategy.execute({ input: this.inputValues });
		if (this.observer) {
			this.observable = from(generator);
			this.observable.subscribe(this.observer);
		} else {
			const results: Array<Awaited<StrategyOutput>> = [];
			for await (const r of generator) {
				results.push(r);
			}
			return results;
		}
	}
}
