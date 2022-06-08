import { Page } from "playwright";
import { ScrapingStrategy } from "../types";

export class TextContentScraping
  implements ScrapingStrategy<Promise<string[] | null>>
{
  selector: string;
  constructor(selector: string) {
    this.selector = selector;
  }

  async execute(page: Page): Promise<string[] | null> {
    return await page.locator(this.selector).allTextContents();
  }
}
