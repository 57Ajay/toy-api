import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from 'dotenv';
config();
import userRouter from './routes/user.routes';
import toyRouter from './routes/toy.routes';

const app = express();

app.use(cookieParser());
app.use(cors());

app.use(express.urlencoded({
    extended: true,
    limit: '50kb'
}));

app.use(express.json())

app.use("/api/user", userRouter)
app.use("/api/toys", toyRouter);


export default app;
