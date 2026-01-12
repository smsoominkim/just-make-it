import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { registerRoutes } from "../server/routes";
import { serveStatic } from "../server/static";

const app = express();
const httpServer = createServer(app);

declare module "http" {
    interface IncomingMessage {
        rawBody: unknown;
    }
}

app.use(
    express.json({
        verify: (req, _res, buf) => {
            (req as any).rawBody = buf;
        },
    }),
);

app.use(express.urlencoded({ extended: false }));

let initialized = false;

async function init() {
    if (initialized) return;
    await registerRoutes(httpServer, app);
    serveStatic(app);
    initialized = true;
}

export default async function handler(req: any, res: any) {
    await init();
    return app(req, res);
}
