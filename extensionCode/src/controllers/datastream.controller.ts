import type { FastifyReply, FastifyRequest } from "fastify";

export interface DatastreamBody {
  url: string;
  timestamp: string;
  extensionStorage: Record<string, unknown>;
  documentHtml: string;
}

export interface FindByNumeroIdentificacionBody {
  numeroIdentificacion?: string | number | Array<string | number>;
}

export const postDatastreamController = async (
  request: FastifyRequest<{ Body: DatastreamBody }>,
  reply: FastifyReply,
): Promise<void> => {
  await request.server.datastreamService.processAndStore(request.body);
  await reply.code(200).send({ status: "ok" });
};

export const findByNumeroIdentificacionController = async (
  request: FastifyRequest<{ Body: FindByNumeroIdentificacionBody }>,
  reply: FastifyReply,
): Promise<void> => {
  const documents = await request.server.datastreamService.findByNumeroIdentificacion(
    request.body.numeroIdentificacion,
  );

  await reply.code(200).send(documents);
};
