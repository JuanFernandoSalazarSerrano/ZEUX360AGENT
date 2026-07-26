import type { Collection, Db, IndexDescription, MongoClient } from "mongodb";
import { MongoClient as NativeMongoClient } from "mongodb";
import type { ProductEvent } from "../types/product-event.js";

export interface MongoOptions {
  uri: string;
  dbName: string;
}

interface NamedIndex {
  key: IndexDescription["key"];
  name: string;
}

export class MongoDatabase {
  private readonly client: MongoClient;
  private db: Db | null = null;

  constructor(private readonly options: MongoOptions) {
    this.client = new NativeMongoClient(this.options.uri);
  }

  public async connect(): Promise<void> {
    if (this.db) {
      return;
    }

    await this.client.connect();
    this.db = this.client.db(this.options.dbName);
    // Index creation on startup keeps read/query performance predictable in production.
    await this.ensureIndexes();
  }

  public getEventsCollection(): Collection<ProductEvent> {
    if (!this.db) {
      throw new Error("MongoDatabase is not connected.");
    }

    return this.db.collection<ProductEvent>("usersInsights");
  }

  public async ping(): Promise<void> {
    if (!this.db) {
      throw new Error("MongoDatabase is not connected.");
    }

    await this.db.command({ ping: 1 });
  }

  public async close(): Promise<void> {
    await this.client.close();
    this.db = null;
  }

  private async ensureIndexes(): Promise<void> {
    const collection = this.getEventsCollection();
    const indexes: NamedIndex[] = [
      { key: { timestamp: 1 }, name: "idx_timestamp" },
      { key: { merchant: 1 }, name: "idx_merchant" },
      { key: { userId: 1 }, name: "idx_userId" },
      { key: { "product.id": 1 }, name: "idx_product_id" },
      { key: { numeroIdentificacion: 1 }, name: "idx_numeroIdentificacion" },
      { key: { "extensionStorage.numeroIdentificacion": 1 }, name: "idx_extensionStorage_numeroIdentificacion" },
    ];

    await Promise.all(indexes.map((index) => collection.createIndex(index.key, { name: index.name })));
  }
}
