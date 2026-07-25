import type { FastifyPluginAsync } from "fastify";
import {
  findByNumeroIdentificacionController,
  postDatastreamController,
} from "../controllers/datastream.controller.js";

export const datastreamRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/datastream", postDatastreamController);
  fastify.post("/datastream/by-numero-identificacion", findByNumeroIdentificacionController);
};
