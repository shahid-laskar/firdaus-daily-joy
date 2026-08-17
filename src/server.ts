import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

const handler = createStartHandler(defaultStreamHandler);

export default {
  async fetch(request: Request, env?: unknown, ctx?: unknown) {
    return await handler(request, { env, ctx } as any);
  },
};


