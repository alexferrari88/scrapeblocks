/**
 * This strategy allows to take a screenshot of the page and then parse it to extract the map of the page with selected elements.
 * This is akin to what visualping.io does.
 */

import path from "path";
import { ElementHandle, Page } from "playwright";
import { cssPath, xPath as getXPath } from "playwright-dompath";
import { ScrapingStrategy } from "../types";
import { getRandomFileName } from "../utils/utils";
import { BaseStrategy } from "./BaseStrategy";
const sizeOf = require("image-size");
const sizeOfBuffer = require("buffer-image-size");

type BoundingBoxReturn = NonNullable<Awaited<ReturnType<ElementHandle["boundingBox"]>>>;

export type ScreenshotMap = BoundingBoxReturn & {
	cssSelector?: string;
	xPath?: string;
	zIndex: number;
};

export type ImageSizeType = {
	width: number;
	height: number;
	type: string;
};

export class ScreenshotToMapStrategy
	extends BaseStrategy
	implements ScrapingStrategy<Promise<[Buffer | string, ImageSizeType, ScreenshotMap[]]>>
{
	selectors: string[];
	includexpath: boolean = false;
	includeCSSSelectors: boolean = true;
	fileName?: string;
	filePath?: string;

	constructor(selectors: string[], includeCSSSelectors?: boolean) {
		super();
		this.selectors = selectors;
		this.includeCSSSelectors = includeCSSSelectors || false;
	}

	asFile(filePath: string, fileName?: string): ScreenshotToMapStrategy {
		this.fileName = fileName || `${getRandomFileName()}.png`;
		this.filePath = filePath || "./";
		return this;
	}

	getZIndex(xpath: string): number {
		return xpath.split("/").length;
	}

	async execute(page: Page): Promise<[Buffer | string, ImageSizeType, ScreenshotMap[]]> {
		if (this.hooks) await this.runHooks(this.hooks, "beforeInStrategy", page);
		let imgResult: Buffer | string;
		let imgSize: ImageSizeType | undefined;
		if (this.fileName) {
			let savePath = path.join(path.normalize(this.filePath as string), this.fileName);
			await page.screenshot({
				path: savePath,
				fullPage: true,
			});
			imgResult = savePath;
			imgSize = sizeOf(savePath) as ImageSizeType;
		} else {
			imgResult = await page.screenshot({
				fullPage: true,
			});
			imgSize = sizeOfBuffer(imgResult) as ImageSizeType;
		}
		const toReturn: ScreenshotMap[] = [];
		for (const selector of this.selectors) {
			const elements = await page.$$(selector);
			for (const element of elements) {
				const boundingBox = await element.boundingBox();
				if (!boundingBox) continue;
				const xPath = await getXPath(element);
				if (!xPath || xPath == "") continue;
				const cssSelector = this.includeCSSSelectors ? await cssPath(element) : undefined;
				const zIndex = this.getZIndex(xPath);
				toReturn.push({ ...boundingBox, cssSelector, xPath, zIndex });
			}
		}
		if (this.hooks) await this.runHooks(this.hooks, "afterInStrategy", page);
		return [imgResult, imgSize, toReturn];
	}
}
