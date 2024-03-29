import express from "express";
import { GLOBALS } from "../index.js";
import Logger from "../logger.js";
import { ApiResponse } from "../structs/apiresponse.js";
import { Database } from "../structs/database.js";
import { Chunk } from "../types/telemetry.js";

export default function Telemetry(client: Database) {
    const router = express()

    router.get("/chunk:id", (req, res) => {
        // Expect JSON data
        const id = req.params.id;
    });

    /**
     * @api {get} /telemetry/chunk/:id Get a chunk of telemetry data
     */
    router.post("/payload", async (req, res) => {
        if (!req.body.header || !req.body.header.session || client.sessionExists(req.body.session)) {
            return res.json(ApiResponse.error("Missing or invalid session token."));
        }

        const chunk: Chunk = req.body;
        const session = client.getSession(chunk.header.session);

        session.add(chunk);
        session.flush();

        Logger.info(`Received chunk from ${chunk.header.session} with ${chunk.entries.length} entries.`);
        GLOBALS.packetsRecieved += chunk.entries.length;

        res.send("OK");
    })

    return router;
}