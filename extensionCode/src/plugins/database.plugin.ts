import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { MongoDatabase } from "../db/mongo.js";
import type { AppEnv } from "../config/env.js";

interface DatabasePluginOptions {
  env: AppEnv;
}

const databasePluginImpl: FastifyPluginAsync<DatabasePluginOptions> = async (fastify, options) => {
  const db = new MongoDatabase({
    uri: options.env.MONGO_URI,
    dbName: options.env.MONGO_DB_NAME,
  });

  await db.connect();
  fastify.decorate("db", db);

  fastify.addHook("onClose", async () => {
    await db.close();
  });
};

export const databasePlugin = fp(databasePluginImpl, {
  name: "database-plugin",
});
