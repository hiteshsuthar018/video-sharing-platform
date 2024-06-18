import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();

// yaha se ham cors(cross sharing resources) ko configure karte hai aur batate hai ki website kaha kaha se access ki ja skti hai 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//yaha par ham maximum 16kb tak ke json file ko accept karenge bataya hai
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));
//configure for cookie parser
app.use(cookieParser());

//routes import

import userRouter from './routes/user.routes.js'
import videoRouter from "./routes/video.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import playListRouter from "./routes/playList.routes.js"
import commentRouter from "./routes/comment.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import likeRouter from "./routes/like.routes.js"
//router declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/playLists", playListRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/likes", likeRouter);

//https://localhost:8000/api/v1/users/register 



export { app }