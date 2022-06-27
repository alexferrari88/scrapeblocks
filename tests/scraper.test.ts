import { Browser, BrowserContext, Page } from "playwright";
import { Pipeline, Step } from "../src/Pipeline";
import { Click, Type } from "../src/scraping-actions";
import { ListScraping } from "../src/scraping-strategies/ListScraping";
const path = require("path");

expect.extend({
	toBeBrowser(received: Browser) {
		const pass = "newContext" in received;
		return {
			pass,
			message: () => `expected ${received} ${pass ? "" : "not"} to be a browser`,
		};
	},
	toBeBrowserContext(received: BrowserContext) {
		const pass = "newPage" in received;
		return {
			pass,
			message: () => `expected ${received} ${pass ? "" : "not"} to be a browser context`,
		};
	},
	toBePage(received: Page) {
		const pass = "goto" in received;
		return {
			pass,
			message: () => `expected ${received} ${pass ? "" : "not"} to be a page`,
		};
	},
});

interface CustomMatchers<R = unknown> {
	toBeBrowser(): R;
	toBeBrowserContext(): R;
	toBePage(): R;
}

declare global {
	namespace jest {
		interface Expect extends CustomMatchers {}
		interface Matchers<R> extends CustomMatchers<R> {}
		interface InverseAsymmetricMatchers extends CustomMatchers {}
	}
}

describe("Scraper", () => {
	// describe("Batteries-included", () => {
	// 	describe("TextContentScraping Basics", () => {
	// 		const URL = `file://${path.resolve("tests/templates/pricing.html")}`;
	// 		const XPATH_SELECTOR = "xpath=/html/body/section/div[2]/div[2]/div[3]/div[1]/div";
	// 		const CSS_SELECTOR =
	// 			"#pricing-cards > div.price-card.price-card--hero > div.price-card--price > div.price-card--price-text > div";
	// 		const expectedValue = "900";
	// 		const expectedNumberOfLiElement = 18;

	// 		it("should return the text value from a css selector with text", async () => {
	// 			const result = await new Scraper(URL, [new TextContentScraping(CSS_SELECTOR)]).run();
	// 			expect(result).toStrictEqual([expectedValue]);
	// 		});

	// 		it("should return the text value from an xpath selector with text", async () => {
	// 			const result = await new Scraper(URL, [new TextContentScraping(XPATH_SELECTOR)]).run();
	// 			expect(result).toStrictEqual([expectedValue]);
	// 		});

	// 		it("should return an empty string from a selector without text", async () => {
	// 			const result = await new Scraper(URL, [new TextContentScraping(".slider")]).run();
	// 			expect(result).toStrictEqual([""]);
	// 		});

	// 		it("should return an list of strings from a selector with multiple text", async () => {
	// 			const result = await new Scraper(URL, [new TextContentScraping("li")]).run();
	// 			expect(result).toHaveLength(expectedNumberOfLiElement);
	// 		});

	// 		it("should return an empty array for non existing selector", async () => {
	// 			const result = await new Scraper(URL, [new TextContentScraping("asdeqda")]).run();
	// 			expect(result).toStrictEqual([]);
	// 		});

	// 		it("should return an empty array for non existing xpath selector", async () => {
	// 			const result = await new Scraper(URL, [new TextContentScraping("xpath=asdasdasd")]).run();
	// 			expect(result).toStrictEqual([]);
	// 		});
	// 	});

	// 	describe("TextContentScraping with actions", () => {
	// 		const URL = `file://${path.resolve("tests/templates/actions.html")}`;
	// 		const expectedText = "This is a secret message!";
	// 		describe("Click", () => {
	// 			test("should click on a button", async () => {
	// 				const element = "#btn-revealer";
	// 				const selector = "#secret";
	// 				const clickAction = new Click({ element });
	// 				const result = await new Scraper(
	// 					URL,
	// 					[new TextContentScraping(selector)],
	// 					[clickAction]
	// 				).run();
	// 				expect(result).toStrictEqual([expectedText]);
	// 			});

	// 			test("should type in a input box", async () => {
	// 				const element = "#input-revealer";
	// 				const value = "secret";
	// 				const selector = "#you-typed";
	// 				const typeAction = new Type({ element, value });
	// 				const result = await new Scraper(
	// 					URL,
	// 					[new TextContentScraping(selector)],
	// 					[typeAction]
	// 				).run();
	// 				expect(result).toStrictEqual([value]);
	// 			});

	// 			test("should wait", async () => {
	// 				jest.setTimeout(20000);
	// 				const value = "3000";
	// 				const selector = "#hint";
	// 				const expectedHintText = "terces";
	// 				const noWaitResult = await new Scraper(URL, [new TextContentScraping(selector)]).run();
	// 				expect(noWaitResult).toStrictEqual([]);
	// 				const typeAction = new Wait({ value });
	// 				const result = await new Scraper(
	// 					URL,
	// 					[new TextContentScraping(selector)],
	// 					[typeAction]
	// 				).run();
	// 				expect(result).toStrictEqual([expectedHintText]);
	// 			});

	// 			test("should change option in a select element", async () => {
	// 				const element = "#select-revealer";
	// 				const value = "yes";
	// 				const selector = "#secret";
	// 				const typeAction = new Select({ element, value });
	// 				const result = await new Scraper(
	// 					URL,
	// 					[new TextContentScraping(selector)],
	// 					[typeAction]
	// 				).run();
	// 				expect(result).toStrictEqual([expectedText]);
	// 			});

	// 			test("should perform multiple actions", async () => {
	// 				const element = "#input-revealer";
	// 				const value = "secret";
	// 				const selector = "#secret";
	// 				const typeAction = new Type({ element, value });
	// 				const pressAction = new Press({ element, value: "Enter" });
	// 				const result = await new Scraper(
	// 					URL,
	// 					[new TextContentScraping(selector)],
	// 					[typeAction, pressAction]
	// 				).run();
	// 				expect(result).toStrictEqual([expectedText]);
	// 			});

	// 			test("should scroll", async () => {
	// 				const selector = "#secret";
	// 				const scrollAction = new Scroll({});
	// 				const result = await new Scraper(
	// 					URL,
	// 					[new TextContentScraping(selector)],
	// 					[scrollAction]
	// 				).run();
	// 				expect(result).toStrictEqual([expectedText]);
	// 			});

	// 			test("should remove 1 element", async () => {
	// 				const element = "label[for=select-revealer]";
	// 				const beforeResult = await new Scraper(URL, [new TextContentScraping(element)]).run();
	// 				expect(beforeResult).toHaveLength(1);
	// 				const removeAction = new Remove({ element });
	// 				const result = await new Scraper(
	// 					URL,
	// 					[new TextContentScraping(element)],
	// 					[removeAction]
	// 				).run();
	// 				expect(result).toHaveLength(0);
	// 			});

	// 			test("should remove 2 elements", async () => {
	// 				const element = "button";
	// 				const beforeResult = await new Scraper(URL, [new TextContentScraping(element)]).run();
	// 				expect(beforeResult).toHaveLength(2);
	// 				const removeAction = new Remove({ element });
	// 				const result = await new Scraper(
	// 					URL,
	// 					[new TextContentScraping(element)],
	// 					[removeAction]
	// 				).run();
	// 				expect(result).toHaveLength(0);
	// 			});

	// 			test("should execute actions without a strategy", async () => {
	// 				const element = "#btn-revealer";
	// 				const selector = "#secret";
	// 				const clickAction = new Click({ element });
	// 				const { browser, context, page } = await new Scraper<PlaywrightBlocks>(URL, undefined, [
	// 					clickAction,
	// 				]).run();
	// 				const result = await page.locator(selector).allTextContents();
	// 				await browser.close();
	// 				expect(browser).toBeBrowser();
	// 				expect(context).toBeBrowserContext();
	// 				expect(page).toBePage();
	// 				expect(result).toStrictEqual([expectedText]);
	// 			});

	// 			// TODO: cannot set cookies on file://
	// 			// test("should set a cookie", async () => {
	// 			//   const value = "secret";
	// 			//   const selector = "#secret";
	// 			//   const cookies = {
	// 			//     name: "secretCookie",
	// 			//     value,
	// 			//     url: "http://localhost",
	// 			//   };
	// 			//   const cookieAction = new AddCookies({ cookies: [cookies] });
	// 			//   const result = await new Scraper(
	// 			//     URL,
	// 			//     [new TextContentScraping(selector)],
	// 			//     [cookieAction]
	// 			//   ).run();
	// 			//   expect(result).toStrictEqual([expectedText]);
	// 			// });
	// 		});
	// 	});
	// });

	// describe("With external Playwright instances", () => {
	// 	const URL = `file://${path.resolve("tests/templates/pricing.html")}`;
	// 	const CSS_SELECTOR =
	// 		"#pricing-cards > div.price-card.price-card--hero > div.price-card--price > div.price-card--price-text > div";
	// 	const expectedValue = "900";

	// 	describe("withBrowser", () => {
	// 		test("should be able to pass an existing browser instance", async () => {
	// 			const browser = await chromium.launch();
	// 			const spy = jest.spyOn(browser, "newContext");
	// 			const result = await new Scraper(URL, [new TextContentScraping(CSS_SELECTOR)])
	// 				.withBrowser(browser)
	// 				.run();
	// 			await browser.close();
	// 			expect(result).toStrictEqual([expectedValue]);
	// 			expect(spy).toHaveBeenCalled();
	// 			spy.mockRestore();
	// 		});
	// 	});

	// 	describe("withContext", () => {
	// 		test("should be able to pass an existing BrowserContext instance", async () => {
	// 			const browser = await chromium.launch();
	// 			const context = await browser.newContext();
	// 			const spy = jest.spyOn(context, "newPage");
	// 			const result = await new Scraper(URL, [new TextContentScraping(CSS_SELECTOR)])
	// 				.withContext(context)
	// 				.run();
	// 			await browser.close();
	// 			expect(result).toStrictEqual([expectedValue]);
	// 			expect(spy).toHaveBeenCalled();
	// 			spy.mockRestore();
	// 		});
	// 	});

	// 	describe("withPage", () => {
	// 		test("should be able to pass an existing Page instance", async () => {
	// 			const browser = await chromium.launch();
	// 			const context = await browser.newContext();
	// 			const page = await context.newPage();
	// 			const spy = jest.spyOn(page, "goto");
	// 			const result = await new Scraper(URL, [new TextContentScraping(CSS_SELECTOR)])
	// 				.withPage(page)
	// 				.run();
	// 			await browser.close();
	// 			expect(result).toStrictEqual([expectedValue]);
	// 			expect(spy).toHaveBeenCalled();
	// 			spy.mockRestore();
	// 		});
	// 	});
	// });

	describe("new functionalities", () => {
		test("should scrape Amazon products and their reviews", () => {
			const url = "https://amazon.com";
			const keyword = "bbq";
			const strategy1 = new ListScraping({
				url: url,
				groupSelector: ".row",
				itemDescriptor: {
					title: {
						selector: "h2",
						attribute: "textContent",
					},
					price: {
						selector: ".price",
						attribute: "textContent",
					},
					link: {
						selector: "h2",
						attribute: "href",
					},
				},
				preActions: [
					new Type({
						element: "element",
						value: keyword,
					}),
					new Click({
						element: "element",
					}),
				],
				nextPageSelector: "nextPageSelector",
			});
			const step1 = new Step(strategy1);
			const strategy2 = new ListScraping({
				groupSelector: ".review",
				itemDescriptor: {
					title: {
						selector: "h5",
						attribute: "textContent",
					},
					content: {
						selector: "p",
						attribute: "textContent",
					},
					rating: {
						selector: ".rating",
						attribute: "textContent",
					},
					date: {
						selector: ".review-date",
						attribute: "textContent",
					},
				},
			});
			const step2 = new Step(strategy2);
			step2.next = (data) => {};
			step1.observer = step2;
			const p = new Pipeline<string[]>([step1, step2]);

			p.run();
		});
		test("no abstractions", async () => {
			const url =
				"https://www.amazon.com/s?k=rust&i=stripbooks-intl-ship&crid=DWQS7NQZTDOP&sprefix=rust%2Cstripbooks-intl-ship%2C243&ref=nb_sb_noss_1";
			const browser = await chromium.launch();
			const context = await browser.newContext();
			const page: Page = await context.newPage();
			await page.goto(url);
		});
		test("refactor 2", async () => {
			const scraper = new Scraper<string[]>();
			const url = "https://amazon.com";
			const keyword = "bbq";
			const strategy1 = new ListScraping({
				url: url,
				groupSelector: ".row",
				itemDescriptor: {
					title: {
						selector: "h2",
						attribute: "textContent",
					},
					price: {
						selector: ".price",
						attribute: "textContent",
					},
					link: {
						selector: "h2",
						attribute: "href",
					},
				},
				preActions: [
					new Type({
						element: "element",
						value: keyword,
					}),
					new Click({
						element: "element",
					}),
				],
				nextPageSelector: "nextPageSelector",
			});
			const step1 = new Step(strategy1);
			const strategy2 = new ListScraping({
				groupSelector: ".review",
				itemDescriptor: {
					title: {
						selector: "h5",
						attribute: "textContent",
					},
					content: {
						selector: "p",
						attribute: "textContent",
					},
					rating: {
						selector: ".rating",
						attribute: "textContent",
					},
					date: {
						selector: ".review-date",
						attribute: "textContent",
					},
				},
			});
			const step2 = new Step(strategy2);
			step2.next = (data) => {
				this.url = data[0];
				this.execute();
			};
		});
	});
});
