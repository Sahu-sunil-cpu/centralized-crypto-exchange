import express from "express"
import { globalRouter } from "./routes/app";
import cors from "cors"


const app = express();
app.use(cors())
app.use(express.json());

app.use("/api/v1", globalRouter);


app.listen(3001, () => {
    console.log("i am listening on port 3001");
})