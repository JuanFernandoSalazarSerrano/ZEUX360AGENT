import "fastify";
import type { DatastreamService } from "../services/datastream.service.js";
import type { MongoDatabase } from "../db/mongo.js";

declare module "fastify" {
  interface FastifyInstance {
    db: MongoDatabase;
    datastreamService: DatastreamService;
  }
}
