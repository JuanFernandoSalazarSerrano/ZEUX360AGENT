import { GoogleGenAI } from "@google/genai";
import type { CanonicalProduct, ProductInsight } from "../types/product-event.js";

export interface InsightServiceOptions {
  geminiApiKey?: string;
  /**
   * Gemini model id. Defaults to gemini-3.5-flash, which supports
   * structured JSON output and (unlike gemini-2.5-flash, which has an
   * announced Oct 16 2026 shutdown) has no retirement date yet.
   */
  model?: string;
  /**
   * The credit products / offers your business can actually extend.
   * `estimatedCredit` and `recommendedProducts` are constrained via JSON
   * Schema `enum` to this list, so the model can never recommend an offer
   * that doesn't exist. Replace the default with your real product catalog.
   */
  offerCatalog?: string[];
}

const DEFAULT_MODEL = "gemini-3.5-flash";

const DEFAULT_OFFER_CATALOG = [
  "Sports Equipment Credit",
  "Electronics Credit",
  "Home & Living Credit",
  "Travel Credit",
  "General Purchase Credit",
  "Bicycle Insurance",
  "Electronics Insurance",
  "Extended Warranty Program",
  "Sports Cashback Program",
  "Travel Cashback Program",
  "General Cashback Program",
];

const DETECTED_INTENTS = ["Purchase", "Research", "Comparison", "Browsing"];
const PURCHASE_STAGES = ["Awareness", "Consideration", "Evaluation", "Decision"];
const URGENCY_LEVELS = ["Low", "Medium", "High"];

export class InsightService {
  private readonly ai: GoogleGenAI | null;
  private readonly model: string;
  private readonly offerCatalog: string[];

  constructor(options: InsightServiceOptions) {
    this.ai = options.geminiApiKey ? new GoogleGenAI({ apiKey: options.geminiApiKey }) : null;
    this.model = options.model ?? DEFAULT_MODEL;
    this.offerCatalog = options.offerCatalog?.length ? options.offerCatalog : DEFAULT_OFFER_CATALOG;
  }

  /**
   * Generates the `insight` block for a canonical product event.
   *
   * Note this is now async (was sync in the placeholder) — update call
   * sites to `await insightService.buildInsight(product)`.
   *
   * Never throws: falls back to a safe placeholder insight if no API key
   * is configured, the call fails, or the model's output doesn't validate.
   */
  public async buildInsight(product: CanonicalProduct): Promise<ProductInsight> {
    if (!this.ai) {
      return this.fallbackInsight("LLM integration pending: GEMINI_API_KEY missing.");
    }

    try {
const response = await this.ai.models.generateContent({
  model: this.model,
  contents: this.buildPrompt(product),
  config: {
    temperature: 0.2,
    responseMimeType: "application/json",
    responseSchema: this.buildResponseSchema(),
  },
});

      if (!response.text) {
        return this.fallbackInsight("LLM returned an empty response.");
      }

      return this.parseInsight(response.text);
    } catch (error) {
      console.error("InsightService: Gemini call failed", error);
      return this.fallbackInsight("LLM call failed; using placeholder insight.");
    }
  }

  /**
   * Deliberately excludes the shopper's name, ID number, and any other PII
   * from the parent event — the model only ever sees product/browsing
   * signals, never who's browsing.
   */
  private buildPrompt(product: CanonicalProduct): string {
    const signals = {
      title: product.title,
      brand: product.brand,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice,
      currency: product.currency,
      discount: product.discount,
      seller: product.seller,
      rating: product.rating,
      reviews: product.reviews,
      sold: product.sold,
      quantity: product.quantity,
      freeShipping: product.freeShipping,
      condition: product.condition,
      installments: product.installments,
    };

    return [
      "You are a financial-marketing analyst for a fintech that offers point-of-sale credit and cashback on online purchases.",
      "Given the product signals below, infer the shopper's interest, purchase intent, and stage in the buying journey.",
      "Then recommend the single best-fit credit offer plus 2-3 relevant cross-sell offers.",
      "Only choose `estimatedCredit` and `recommendedProducts` from the allowed offer catalog — never invent new offer names.",
      "",
      `Product signals (JSON): ${JSON.stringify(signals)}`,
    ].join("\n");
  }

  private buildResponseSchema() {
    return {
      type: "object",
      properties: {
        interest: {
          type: "string",
          description: "High-level category of interest, e.g. 'Cycling'.",
        },
        detectedIntent: { type: "string", enum: DETECTED_INTENTS },
        purchaseStage: { type: "string", enum: PURCHASE_STAGES },
        estimatedCredit: { type: "string", enum: this.offerCatalog },
        cashback: {
          type: "string",
          description: "Cashback rate as a percentage string, e.g. '5%'.",
        },
        confidence: { type: "number", minimum: 0, maximum: 1 },
        urgency: { type: "string", enum: URGENCY_LEVELS },
        reasoning: {
          type: "string",
          description: "1-2 sentences grounded in the product signals provided.",
        },
        recommendedProducts: {
          type: "array",
          items: { type: "string", enum: this.offerCatalog },
          minItems: 1,
          maxItems: 5,
        },
      },
      required: [
        "interest",
        "detectedIntent",
        "purchaseStage",
        "estimatedCredit",
        "cashback",
        "confidence",
        "urgency",
        "reasoning",
        "recommendedProducts",
      ],
    };
  }

  private parseInsight(raw: string): ProductInsight {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return this.fallbackInsight("LLM returned malformed JSON.");
    }

    if (!this.isProductInsight(parsed)) {
      return this.fallbackInsight("LLM output failed validation.");
    }

    return parsed;
  }

  private isProductInsight(value: unknown): value is ProductInsight {
    if (typeof value !== "object" || value === null) return false;
    const v = value as Record<string, unknown>;
    return (
      typeof v["interest"] === "string" &&
      typeof v["detectedIntent"] === "string" &&
      typeof v["purchaseStage"] === "string" &&
      typeof v["estimatedCredit"] === "string" &&
      typeof v["cashback"] === "string" &&
      typeof v["confidence"] === "number" &&
      typeof v["urgency"] === "string" &&
      typeof v["reasoning"] === "string" &&
      Array.isArray(v["recommendedProducts"]) &&
      v["recommendedProducts"].every((item) => typeof item === "string")
    );
  }

  private fallbackInsight(reason: string): ProductInsight {
    return {
      interest: "Unknown",
      detectedIntent: "Browsing",
      purchaseStage: "Awareness",
      estimatedCredit: this.offerCatalog[0] ?? "General Purchase Credit",
      cashback: "0%",
      confidence: 0,
      urgency: "Low",
      reasoning: reason,
      recommendedProducts: [],
    };
  }
}