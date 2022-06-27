import { from, Observable, Observer } from "rxjs";
import { ScrapingStrategy } from "./types";

export class Pipeline<StrategyOutput> {
	steps: Step<unknown>[];
	constructor(steps: Step<unknown>[]) {
		this.steps = steps;
	}
}

export class Step<StrategyOutput, NextStrategyInput = StrategyOutput>
	implements Partial<Observer<NextStrategyInput>>
{
	next?: (value: NextStrategyInput) => void;
	error?: (err: any) => void;
	complete?: () => void;
	inputValues?: NextStrategyInput;
	strategy: ScrapingStrategy<StrategyOutput>;
	observable?: Observable<StrategyOutput>;
	observer?: Observer<StrategyOutput>;

	constructor(strategy: ScrapingStrategy<StrategyOutput>, inputValues?: NextStrategyInput) {
		this.strategy = strategy;
		this.inputValues = inputValues;
	}

	async run(): Promise<StrategyOutput | StrategyOutput[] | void> {
		if (!this.strategy) throw new Error("No strategy set");
		const generator = this.strategy.execute();
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
