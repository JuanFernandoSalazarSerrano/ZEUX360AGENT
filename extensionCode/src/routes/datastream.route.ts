import type { FastifyPluginAsync } from "fastify";
import {
  findByNumeroIdentificacionController,
  postDatastreamController,
} from "../controllers/datastream.controller.js";

export const datastreamRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/health", async () => {
    await fastify.db.ping();
    return { status: "ok", db: "ok" };
  });

  fastify.post("/datastream", postDatastreamController);
  fastify.post("/datastream/by-numero-identificacion", findByNumeroIdentificacionController);
};
