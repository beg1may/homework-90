import express from "express";
import expressWs from "express-ws";
import cors from "cors";

const app = express();
const wsInstance = expressWs(app);

const port = 8000;
app.use(cors());

const router = express.Router();
wsInstance.applyTo(router);

router.ws('/chat', (ws, req) => {
    console.log('Client connected');

    ws.on('close', () => {
        console.log("Client disconnectedимп");
    })
});

app.use(router);

app.listen(port, () => {
    console.log(`listening on port ${port}`);
})