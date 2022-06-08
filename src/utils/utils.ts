export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type ObjectWithKeysFromGeneric<T, U> = {
  [key in keyof T]: U;
};

export function validateOptions<T>(
  options: T,
  errors: ObjectWithKeysFromGeneric<T, string>
) {
  for (const key in errors) {
    if (options[key] == undefined) {
      throw new Error(errors[key]);
    }
  }
}
