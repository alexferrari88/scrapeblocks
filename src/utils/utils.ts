export function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export type ObjectWithKeysFromGeneric<T, U> = {
	[key in keyof T]: U;
};

export function validateOptions<T>(options: T, errors: ObjectWithKeysFromGeneric<T, string>) {
	for (const key in errors) {
		if (options[key] == undefined) {
			throw new Error(errors[key]);
		}
	}
}

export function getRandomFileName(prefix?: string) {
	const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
	const random = ("" + Math.random()).substring(2, 8);
	const random_number = timestamp + random;
	return `${prefix}${random_number}`;
}

export function makeTupleByArray<T extends Array<unknown>>(items: [...T]) {
	return items;
}
