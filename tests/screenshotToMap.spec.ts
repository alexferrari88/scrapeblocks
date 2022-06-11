import * as fs from "fs";
import { chromium } from "playwright";
import { Scraper } from "../src";
import { ScreenshotMap, ScreenshotToMap } from "../src/scraping-strategies";
import { ImageSizeType } from "../src/scraping-strategies/ScreenshotToMap";
const path = require("path");

expect.extend({
	toHaveSizes(imgSize: ImageSizeType, width: number, height: number) {
		return {
			pass: imgSize.width === width && imgSize.height === height,
			message: () => `expected ${imgSize.width}x${imgSize.height} to equal ${width}x${height}`,
		};
	},
	toBeScreenshotMap(received: ScreenshotMap) {
		return {
			pass:
				"cssSelector" in received &&
				"xPath" in received &&
				"zIndex" in received &&
				"width" in received &&
				"height" in received &&
				"x" in received &&
				"y" in received,
			message: () => `expected the item with xPath ${received.xPath} to be a screenshot map`,
		};
	},
});

interface CustomMatchers<R = unknown> {
	toHaveSizes(width: number, height: number): R;
	toBeScreenshotMap(): R;
}

declare global {
	namespace jest {
		interface Expect extends CustomMatchers {}
		interface Matchers<R> extends CustomMatchers<R> {}
		interface InverseAsymmetricMatchers extends CustomMatchers {}
	}
}
describe("ScreenshotToMap Basics", () => {
	const screenshotsFolder = path.resolve("tests/screenshots");
	const imgWidth = 1280;
	const imgHeight = 846;
	afterAll(() => {
		fs.rmSync(screenshotsFolder, { recursive: true, force: true });
	});

	test("should take a screenshot", async () => {
		const URL = `file://${path.resolve("tests/templates/pricing.html")}`;
		const selector = ["div", "p", "a", "table", "img"];
		const browser = await chromium.launch();
		const context = await browser.newContext();
		const page = await context.newPage();
		const spy = jest.spyOn(page, "screenshot");
		const _ = await new Scraper(URL, new ScreenshotToMap(selector)).withPage(page).run();
		await browser.close();
		expect(spy).toHaveBeenCalled();
		spy.mockRestore();
	});

	test("should return a buffer, and map", async () => {
		const URL = `file://${path.resolve("tests/templates/pricing.html")}`;
		const selector = ["div", "p", "a", "table", "img"];
		const numElements = 27;
		const [fileBuffer, imgSize, screenshotMap] = await new Scraper(
			URL,
			new ScreenshotToMap(selector)
		).run();
		expect(typeof fileBuffer).toBe("object");
		expect(imgSize).toHaveSizes(imgWidth, imgHeight);
		expect(imgSize.type).toStrictEqual("png");
		screenshotMap.forEach((item) => {
			expect(item).toBeScreenshotMap();
		});
		expect(screenshotMap.length).toStrictEqual(numElements);
	});

	test("should take a screenshot and save it as file", async () => {
		const URL = `file://${path.resolve("tests/templates/pricing.html")}`;
		const selector = ["div", "p", "a", "table", "img"];
		const [file, imgSize, screenshotMap] = await new Scraper(
			URL,
			new ScreenshotToMap(selector).asFile(screenshotsFolder)
		).run();
		const fileExists = fs.existsSync(file);
		expect(fileExists).toBeTruthy();
		expect(typeof file).toStrictEqual("string");
		expect(imgSize.type).toStrictEqual("png");
		expect(imgSize).toHaveSizes(imgWidth, imgHeight);
		screenshotMap.forEach((item) => {
			expect(item).toBeScreenshotMap();
		});
	});
});
