import "dotenv/config";
import DOMPurify from "isomorphic-dompurify";
import { NextResponse, NextRequest } from "next/server";
import puppeteer, { type Browser, type Page } from "puppeteer";
import sharp from "sharp";
import * as z from "zod";
import dns from "node:dns/promises";
import ipaddr from "ipaddr.js";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI();

const encoder = new TextEncoder();

const summaryJsonSchema = {
  type: "object" as const,
  properties: {
    website_name: {
      type: "string" as const,
      description: " The name of the company or website.",
    },
    html_content: {
      type: "string" as const,
      description:
        "The complete, detailed master summary of the site wrapped entirely in clean semantic HTML elements like <h1>, <h2>, <p>, <ul>, <li>.",
    },
  },
  required: ["website_name", "html_content"],
};

const summarySchema = z.fromJSONSchema(summaryJsonSchema);

function isTransientGeminiError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /\b500\b|\b503\b|high demand|temporarily unavailable/i.test(message);
}

function isGeminiRateLimitError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /\b429\b|rate limit exceeded|quota/i.test(message);
}

async function withGeminiRetry<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransientGeminiError(error) || attempt >= 2) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}

async function capturePageScreenshot(page: Page) {
  const screenshot = await page.screenshot({
    fullPage: true,
    type: "jpeg",
    quality: 80,
  });

  return sharp(screenshot)
    .resize({
      width: 1024,
      height: 2048,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 70 })
    .toBuffer()
    .then((image) => image.toString("base64"));
}

export async function POST(req: NextRequest) {
  let browser: Browser | null = null;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: object) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      void (async () => {
        try {
          const summaries: { pageScreenShots: string }[] = [];
          const potentialPages: string[] = [];

          send({ phase: "Analizing Link" });

          let formData;

          let url;

          let domainName;

          try {
            formData = await req.formData();

            url = formData.get("url") as string;

            const parsedLink = new URL(url);
            if (
              parsedLink.protocol !== "https:" &&
              parsedLink.protocol !== "http:"
            ) {
              throw new Error(
                "Invalid URL format: Only HTTP and HTTPS links are allowed.",
              );
            }
            const { address } = await dns.lookup(parsedLink.hostname);
            if (ipaddr.parse(address).range() !== "unicast") {
              throw new Error("Localhost and private links are not allowed.");
            }
            potentialPages.push(url);
            domainName = new URL(url).hostname;
          } catch (e) {
            send({
              message: e instanceof Error ? e.message : "Invalid form data",
              status: 400,
            });
            return;
          }

          browser = await puppeteer.launch({ headless: true });

          const page = await browser.newPage();

          await page.setViewport({ width: 1280, height: 800 });

          const response = await page.goto(url, {
            waitUntil: "networkidle2",
          });

          if (!response || !response.ok()) {
            send({
              message: `URL: ${url} is in valid and website does not exist. ${response?.status()}`,
              status: 400,
            });
            return;
          }

          const allLinks = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("a")).map(
              (a) => a.href,
            );
          });

          for (const link of allLinks) {
            if (new URL(link).hostname !== domainName) continue;
            const response = await page.goto(link, {
              waitUntil: "networkidle2",
            });
            if (response?.ok()) {
              potentialPages.push(link);
            }
            if (potentialPages.length === 6) break;
          }

          send({
            phase: "Gathering Pages",
          });

          for (const link of potentialPages) {
            await page.goto(link, {
              waitUntil: "networkidle2",
            });
            const pages = await capturePageScreenshot(page);
            summaries.push({
              pageScreenShots: pages,
            });

            send({
              phase: "Gathering Pages",
              gatheredPages: summaries.length,
              totalPages: potentialPages.length,
            });
          }
          send({ phase: "Summarizing Pages" });
          const interaction3 = await withGeminiRetry(() =>
            genAI.interactions.create({
              model: "gemini-3.8-flash",
              input: [
                {
                  type: "text",
                  text: `You are looking at screenshot of a website ${url} made by puppeteer. 
          Review these images generated from the visual screenshots of all its potential subpages, 
          and compile them into one high-level, total website summary, and desplay them in HTML 
          format and use style="" instead of class attribute, so design it how ever, strictly 
          using this colors pallets of different shade and opacity, orange, black, lightblue, purple. 
          Also  no background color, and orange and purple should be used in little things. Main 
          color should be lightblue, black  Style text size, marginal space and padding considering 
          a containerof maxed width 440px, use font bold where its needed and also make sure its  
          aesthetic. Use font  Geist, Geist_Mono of different width you can even use some italic when 
          it would be fitted. Don't let it get too long at the same time keep it incredibly detailed 
          Only allowed tags are:
          ["h1",
          "h2",
          "h3",
          "p",
          "ul",
          "ol",
          "li",
          "strong",
          "em",
          "br"] Make sure its in a very clean html format.`,
                },
                ...summaries.map(({ pageScreenShots }) => ({
                  type: "image" as const,
                  data: pageScreenShots,
                  mime_type: "image/jpeg" as const,
                })),
              ],
              response_format: {
                type: "text",
                mime_type: "application/json",
                schema: summaryJsonSchema,
              },
            }),
          );
          if (!interaction3.output_text) {
            throw new Error("Summary response was empty");
          }

          const parsedSummary = summarySchema.parse(
            JSON.parse(interaction3.output_text),
          ) as { website_name: string; html_content: string };

          const safeSummary = {
            ...parsedSummary,
            html_content: DOMPurify.sanitize(parsedSummary.html_content, {
              ALLOWED_TAGS: [
                "h1",
                "h2",
                "h3",
                "p",
                "ul",
                "ol",
                "li",
                "strong",
                "em",
                "br",
              ],
              ALLOWED_ATTR: ["style"],
            }),
          };
          send({
            phase: "Summary Completed",
            gatheredPages: summaries.length,
            masterSummary: safeSummary,
          });
        } catch (error) {
          console.error("Summary route failed:", error);
          if (isGeminiRateLimitError(error)) {
            send({
              message: `The Gemini usage limit has been reached. Please try again after the 
                quota resets or check your API plan.`,
              status: 429,
            });
            return;
          }

          if (isTransientGeminiError(error)) {
            send({
              message:
                "The summary service is temporarily busy. Please try again shortly.",
              status: 503,
            });
            return;
          }

          send({ message: "Internal server error", status: 500 });
        } finally {
          await browser?.close();
          browser = null;
          controller.close();
        }
      })();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
