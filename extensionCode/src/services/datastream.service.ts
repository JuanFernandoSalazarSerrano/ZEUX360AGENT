import type { Collection, InsertOneResult } from "mongodb";
import type { DatastreamPayloadInput } from "../models/datastream.js";
import { datastreamPayloadSchema } from "../models/datastream.js";
import { runMercadoLibreEtl } from "../etl/pipeline.js";
import type { ProductEvent } from "../types/product-event.js";
import { detectMerchant } from "../utils/merchant.js";
import { ValidationHttpError } from "../utils/errors.js";
import type { InsightService } from "./insight.service.js";

export class DatastreamService {
  private static readonly MAX_DOCUMENT_HTML_LENGTH = 10_000_000;

  constructor(
    private readonly eventsCollection: Collection<ProductEvent>,
    private readonly insightService: InsightService,
  ) {}

  public async processAndStore(payload: unknown): Promise<InsertOneResult<ProductEvent>> {
    // Request validation is explicit here (instead of route schema hooks) to keep ETL reusable.
    const parsedPayload = this.validatePayload(payload);
    const merchant = detectMerchant(parsedPayload.url);

    const documentHtml = this.truncateDocumentHtml(parsedPayload.documentHtml);

    // ETL is isolated and deterministic; no I/O side effects happen before canonicalization.
    const { product } = runMercadoLibreEtl(documentHtml);

    const insight = await this.insightService.buildInsight(product);

    const event: ProductEvent = {
      userId: this.resolveUserId(parsedPayload.extensionStorage),
      timestamp: new Date(parsedPayload.timestamp),
      nombre: this.resolveStringField(parsedPayload.extensionStorage, ["nombre", "name"]),
      numeroIdentificacion: this.resolveStringField(parsedPayload.extensionStorage, [
        "numeroIdentificacion",
        "numero_identificacion",
        "numero_documento_usuario",
      ]),
      tipoIdentificacion: this.resolveStringField(parsedPayload.extensionStorage, [
        "tipoIdentificacion",
        "tipo_identificacion",
        "tipo_documento_usuario",
      ]),
      merchant,
      url: parsedPayload.url,
      extensionStorage: parsedPayload.extensionStorage,
      product,
      // Insight is intentionally a placeholder until LLM inference is enabled.
      insight,
    };

    return this.eventsCollection.insertOne(event);
  }

  public async findByNumeroIdentificacion(
    numeroIdentificacion: string | number | Array<string | number> | undefined,
  ): Promise<ProductEvent[]> {
    const values = this.normalizeNumeroIdentificacionValues(numeroIdentificacion);

    if (values.length === 0) {
      return [];
    }

    const conditions = values.flatMap((value) => {
      const normalizedValue = String(value);
      return [
        { numeroIdentificacion: normalizedValue },
        { numero_identificacion: normalizedValue },
        { NumeroIdentificacion: normalizedValue },
        { "extensionStorage.numeroIdentificacion": normalizedValue },
        { "extensionStorage.numero_identificacion": normalizedValue },
        { "extensionStorage.NumeroIdentificacion": normalizedValue },
        { "extensionStorage.numero_documento_usuario": normalizedValue },
      ];
    });

    return this.eventsCollection.find({ $or: conditions }).toArray();
  }

  private normalizeNumeroIdentificacionValues(
    input: string | number | Array<string | number> | undefined,
  ): string[] {
    if (Array.isArray(input)) {
      return input.flatMap((value) => this.buildNumeroIdentificacionStrings(value));
    }

    if (typeof input === "string" || typeof input === "number") {
      return this.buildNumeroIdentificacionStrings(input);
    }

    return [];
  }

  private buildNumeroIdentificacionStrings(value: string | number): string[] {
    const normalizedValue = typeof value === "string" ? value.trim() : String(value);

    if (normalizedValue === "") {
      return [];
    }

    return [normalizedValue];
  }

  private validatePayload(payload: unknown): DatastreamPayloadInput {
    const parsed = datastreamPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      const details = parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw new ValidationHttpError(`Invalid /datastream payload. ${details}`);
    }

    return parsed.data;
  }

  private truncateDocumentHtml(documentHtml: string): string {
    if (documentHtml.length <= DatastreamService.MAX_DOCUMENT_HTML_LENGTH) {
      return documentHtml;
    }

    return documentHtml.slice(0, DatastreamService.MAX_DOCUMENT_HTML_LENGTH);
  }

  private resolveUserId(storage: Record<string, unknown>): string {
    const userIdCandidate = storage["userId"] ?? storage["user_id"] ?? storage["uid"];

    if (typeof userIdCandidate === "string" && userIdCandidate.trim()) {
      return userIdCandidate.trim();
    }

    if (typeof userIdCandidate === "number") {
      return String(userIdCandidate);
    }

    return "anonymous";
  }

  private resolveStringField(storage: Record<string, unknown>, keys: string[]): string | undefined {
    for (const key of keys) {
      const value = storage[key];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }

      if (typeof value === "number") {
        return String(value);
      }
    }

    return undefined;
  }
}
