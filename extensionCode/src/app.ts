import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { ZodError } from "zod";
import type { AppEnv } from "./config/env.js";
import { datastreamRoutes } from "./routes/datastream.route.js";
import { databasePlugin } from "./plugins/database.plugin.js";
import { servicesPlugin } from "./plugins/services.plugin.js";
import { EtlError, ValidationHttpError } from "./utils/errors.js";

export const buildApp = async (env: AppEnv): Promise<FastifyInstance> => {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
    methods: ["POST", "OPTIONS"],
  });

  await app.register(sensible);
  await app.register(databasePlugin, { env });
  await app.register(servicesPlugin, { env });
  await app.register(datastreamRoutes);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ValidationHttpError || error instanceof ZodError) {
      reply.status(400).send({ error: error.message });
      return;
    }

    if (error instanceof EtlError) {
      reply.status(400).send({ error: error.message });
      return;
    }

    app.log.error(error);
    reply.status(500).send({ error: "Internal Server Error" });
  });

  return app;
};
