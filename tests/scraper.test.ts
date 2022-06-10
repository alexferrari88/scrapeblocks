﻿import { chromium } from "playwright";
import { Scraper } from "../src/index";
import {
  Click,
  Press,
  Scroll,
  Select,
  Type,
  Wait,
} from "../src/scraping-actions";
import { TextContentScraping } from "../src/scraping-strategies/TextContentScraping";
const path = require("path");

describe("Scraper", () => {
  describe("Batteries-included", () => {
    describe("TextContentScraping Basics", () => {
      const URL = `file://${path.resolve("tests/templates/pricing.html")}`;
      const XPATH_SELECTOR =
        "xpath=/html/body/section/div[2]/div[2]/div[3]/div[1]/div";
      const CSS_SELECTOR =
        "#pricing-cards > div.price-card.price-card--hero > div.price-card--price > div.price-card--price-text > div";
      const expectedValue = "900";
      const expectedNumberOfLiElement = 18;

      it("should return the text value from a css selector with text", async () => {
        const result = await new Scraper(
          URL,
          new TextContentScraping(CSS_SELECTOR)
        ).run();
        expect(result).toStrictEqual([expectedValue]);
      });

      it("should return the text value from an xpath selector with text", async () => {
        const result = await new Scraper(
          URL,
          new TextContentScraping(XPATH_SELECTOR)
        ).run();
        expect(result).toStrictEqual([expectedValue]);
      });

      it("should return an empty string from a selector without text", async () => {
        const result = await new Scraper(
          URL,
          new TextContentScraping(".slider")
        ).run();
        expect(result).toStrictEqual([""]);
      });

      it("should return an list of strings from a selector with multiple text", async () => {
        const result = await new Scraper(
          URL,
          new TextContentScraping("li")
        ).run();
        expect(result).toHaveLength(expectedNumberOfLiElement);
      });

      it("should return an empty array for non existing selector", async () => {
        const result = await new Scraper(
          URL,
          new TextContentScraping("asdeqda")
        ).run();
        expect(result).toStrictEqual([]);
      });

      it("should return an empty array for non existing xpath selector", async () => {
        const result = await new Scraper(
          URL,
          new TextContentScraping("xpath=asdasdasd")
        ).run();
        expect(result).toStrictEqual([]);
      });
    });

    describe("TextContentScraping with actions", () => {
      const URL = `file://${path.resolve("tests/templates/actions.html")}`;
      const expectedText = "This is a secret message!";
      describe("Click", () => {
        test("should click on a button", async () => {
          const element = "#btn-revealer";
          const selector = "#secret";
          const clickAction = new Click({ element });
          const result = await new Scraper(
            URL,
            new TextContentScraping(selector),
            [clickAction]
          ).run();
          expect(result).toStrictEqual([expectedText]);
        });

        test("should type in a input box", async () => {
          const element = "#input-revealer";
          const value = "secret";
          const selector = "#you-typed";
          const typeAction = new Type({ element, value });
          const result = await new Scraper(
            URL,
            new TextContentScraping(selector),
            [typeAction]
          ).run();
          expect(result).toStrictEqual([value]);
        });

        test("should wait", async () => {
          jest.setTimeout(20000);
          const value = "3000";
          const selector = "#hint";
          const expectedHintText = "terces";
          const noWaitResult = await new Scraper(
            URL,
            new TextContentScraping(selector)
          ).run();
          expect(noWaitResult).toStrictEqual([]);
          const typeAction = new Wait({ value });
          const result = await new Scraper(
            URL,
            new TextContentScraping(selector),
            [typeAction]
          ).run();
          expect(result).toStrictEqual([expectedHintText]);
        });

        test("should change option in a select element", async () => {
          const element = "#select-revealer";
          const value = "yes";
          const selector = "#secret";
          const typeAction = new Select({ element, value });
          const result = await new Scraper(
            URL,
            new TextContentScraping(selector),
            [typeAction]
          ).run();
          expect(result).toStrictEqual([expectedText]);
        });

        test("should perform multiple actions", async () => {
          const element = "#input-revealer";
          const value = "secret";
          const selector = "#secret";
          const typeAction = new Type({ element, value });
          const pressAction = new Press({ element, value: "Enter" });
          const result = await new Scraper(
            URL,
            new TextContentScraping(selector),
            [typeAction, pressAction]
          ).run();
          expect(result).toStrictEqual([expectedText]);
        });

        test("should scroll", async () => {
          const selector = "#secret";
          const scrollAction = new Scroll({});
          const result = await new Scraper(
            URL,
            new TextContentScraping(selector),
            [scrollAction]
          ).run();
          expect(result).toStrictEqual([expectedText]);
        });

        // TODO: cannot set cookies on file://
        // test("should set a cookie", async () => {
        //   const value = "secret";
        //   const selector = "#secret";
        //   const cookies = {
        //     name: "secretCookie",
        //     value,
        //     url: "http://localhost",
        //   };
        //   const cookieAction = new AddCookies({ cookies: [cookies] });
        //   const result = await new Scraper(
        //     URL,
        //     new TextContentScraping(selector),
        //     [cookieAction]
        //   ).run();
        //   expect(result).toStrictEqual([expectedText]);
        // });
      });
    });
  });

  describe("With external Playwright instances", () => {
    const URL = `file://${path.resolve("tests/templates/pricing.html")}`;
    const CSS_SELECTOR =
      "#pricing-cards > div.price-card.price-card--hero > div.price-card--price > div.price-card--price-text > div";
    const expectedValue = "900";

    describe("withBrowser", () => {
      test("should be able to pass an existing browser instance", async () => {
        const browser = await chromium.launch();
        const spy = jest.spyOn(browser, "newContext");
        const result = await new Scraper(
          URL,
          new TextContentScraping(CSS_SELECTOR)
        )
          .withBrowser(browser)
          .run();
        await browser.close();
        expect(result).toStrictEqual([expectedValue]);
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe("withContext", () => {
      test("should be able to pass an existing BrowserContext instance", async () => {
        const browser = await chromium.launch();
        const context = await browser.newContext();
        const spy = jest.spyOn(context, "newPage");
        const result = await new Scraper(
          URL,
          new TextContentScraping(CSS_SELECTOR)
        )
          .withContext(context)
          .run();
        await browser.close();
        expect(result).toStrictEqual([expectedValue]);
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe("withPage", () => {
      test("should be able to pass an existing Page instance", async () => {
        const browser = await chromium.launch();
        const context = await browser.newContext();
        const page = await context.newPage();
        const spy = jest.spyOn(page, "goto");
        const result = await new Scraper(
          URL,
          new TextContentScraping(CSS_SELECTOR)
        )
          .withPage(page)
          .run();
        await browser.close();
        expect(result).toStrictEqual([expectedValue]);
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });
  });
});