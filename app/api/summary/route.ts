import "dotenv/config";
import DOMPurify from "isomorphic-dompurify";
import { NextResponse, NextRequest } from "next/server";
import puppeteer, { type Browser } from "puppeteer";
import * as z from "zod";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI();

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

export async function POST(req: NextRequest) {
  let browser: Browser | null = null;
  try {
    const summaries: { pagesSummary: unknown }[] = [];

    let formData;

    let url;

    let domainName;

    try {
      formData = await req.formData();

      url = formData.get("url") as string;

      domainName = new URL(url).hostname;
    } catch (e) {
      return NextResponse.json("Invalid form data", { status: 400 });
    }
    browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(url, { waitUntil: "networkidle2" });

    const imageBinary = await page.screenshot({
      fullPage: true,
      type: "jpeg",
    });
    const pages = Buffer.from(imageBinary).toString("base64");

    const interaction = await withGeminiRetry(() =>
      genAI.interactions.create({
        model: "gemini-3.8-flash",
        input: [
          {
            type: "text",
            text: "Analyze this website screenshot and summarize it in 3 extremly detailed sentences.",
          },
          {
            type: "image",
            data: pages,
            mime_type: "image/jpeg",
          },
        ],
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: summaryJsonSchema,
        },
      }),
    );
    if (!interaction.output_text) {
      throw new Error("Summary response was empty");
    }
    summaries.push({
      pagesSummary: summarySchema.parse(JSON.parse(interaction.output_text)),
    });

    const allLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("a")).map((a) => a.href);
    });

    const potentialPages = allLinks
      .filter((link) => new URL(link).hostname === domainName)
      .splice(0, 5);

    for (const link of potentialPages) {
      await page.goto(link, { waitUntil: "networkidle2" });

      const imageBinary = await page.screenshot({
        fullPage: true,
        type: "jpeg",
      });

      const pages = Buffer.from(imageBinary).toString("base64");

      const interaction2 = await withGeminiRetry(() =>
        genAI.interactions.create({
          model: "gemini-3.8-flash",
          input: [
            {
              type: "text",
              text: "Analyze this website screenshot and summarize it in 3 extremly detailed sentences.",
            },
            {
              type: "image",
              data: pages,
              mime_type: "image/jpeg",
            },
          ],
          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: summaryJsonSchema,
          },
        }),
      );
      if (!interaction2.output_text) {
        throw new Error("Summary response was empty");
      }
      summaries.push({
        pagesSummary: summarySchema.parse(JSON.parse(interaction2.output_text)),
      });
    }

    const interaction3 = await withGeminiRetry(() =>
      genAI.interactions.create({
        model: "gemini-3.8-flash",
        input: [
          {
            type: "text",
            text: `You are looking at a full structural breakdown of the website ${url}. 
          Review these text-only summaries generated from the visual screenshots of all its subpages, 
          and compile them into one high-level, total website summary, and desplay them in HTML 
          format and use  normal style="" attribut so design it how ever, strictly using colors like blue, lightblue,
          orange, black and white. Style text size marginal space and padding considaring a container of 
          maxed width 440px. Only allowed tags are["h1",
          "h2",
          "h3",
          "p",
          "ul",
          "ol",
          "li",
          "strong",
          "em",
          "br"] Make sure its in a very clean html format.
          
          Website Data:
          ${summaries.map(({ pagesSummary }) => JSON.stringify(pagesSummary)).join("\n\n")}`,
          },
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

    return NextResponse.json({
      message: "Finished summarizing",
      masterSummary: safeSummary,
      pagesProcessedCount: potentialPages.length,
    });
  } catch (error) {
    console.error("Summary route failed:", error);
    if (isGeminiRateLimitError(error)) {
      return NextResponse.json(
        {
          message:
            "The Gemini usage limit has been reached. Please try again after the quota resets or check your API plan.",
        },
        { status: 429 },
      );
    }

    if (isTransientGeminiError(error)) {
      return NextResponse.json(
        {
          message:
            "The summary service is temporarily busy. Please try again shortly.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await browser?.close();
    browser = null;
  }
}
