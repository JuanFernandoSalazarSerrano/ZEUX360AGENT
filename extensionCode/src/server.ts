import "dotenv/config";
import { buildApp } from "./app.js";
import { getEnv } from "./config/env.js";

const startServer = async (): Promise<void> => {
  const env = getEnv();
  const app = await buildApp(env);

  try {
    await app.listen({
      host: "0.0.0.0",
      port: env.PORT,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  const closeSignals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];

  closeSignals.forEach((signal) => {
    process.on(signal, async () => {
      await app.close();
      process.exit(0);
    });
  });
};

void startServer();
