import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import {WebSocket} from "ws";

const app = express();
const wsInstance = expressWs(app);

const port = 8000;
app.use(cors());

const router = express.Router();
wsInstance.applyTo(router);

const connectedClient: WebSocket[] = [];
interface IncomingPixels {
    x: number;
    y: number;
}

const pixels: IncomingPixels[] = [];

router.ws('/pixel', (ws, req) => {
    connectedClient.push(ws);

    ws.send(JSON.stringify({
        type: "SEND_PIXEL",
        pixels: pixels
    }));

    ws.on('pixel', (pixel) => {
        try {
            const decodedPixel = JSON.parse(pixel.toString());

            if (decodedPixel.type === "NEW_PIXEL") {
                pixels.push(decodedPixel.payload);
                connectedClient.forEach(clientWS => {
                    clientWS.send(JSON.stringify({
                        type: "NEW_PIXEL",
                        payload: decodedPixel.payload
                    }));
                });
            }
        } catch (e) {
            ws.send(JSON.stringify({error: e }));
        }
    });

    ws.on('close', () => {
        const index = connectedClient.indexOf(ws);
        connectedClient.splice(index, 1);
    })
});

app.use(router);

app.listen(port, () => {
    console.log(`listening on port ${port}`);
})