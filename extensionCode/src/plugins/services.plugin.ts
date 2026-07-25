import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import type { AppEnv } from "../config/env.js";
import { DatastreamService } from "../services/datastream.service.js";
import { InsightService } from "../services/insight.service.js";

interface ServicesPluginOptions {
  env: AppEnv;
}

const servicesPluginImpl: FastifyPluginAsync<ServicesPluginOptions> = async (fastify, options) => {
  const insightService = options.env.GEMINI_API_KEY
    ? new InsightService({ geminiApiKey: options.env.GEMINI_API_KEY })
    : new InsightService({});
  const datastreamService = new DatastreamService(fastify.db.getEventsCollection(), insightService);
  fastify.decorate("datastreamService", datastreamService);
};

export const servicesPlugin = fp(servicesPluginImpl, {
  name: "services-plugin",
  dependencies: ["database-plugin"],
});
