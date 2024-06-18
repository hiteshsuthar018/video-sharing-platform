import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";
const router = Router();

router.use(verifyJWT);


//subscription
router.route("/v/:videoId").patch(toggleVideoLike);
router.route("/c/:commentId").patch(toggleCommentLike);
router.route("/t/:tweetId").patch(toggleTweetLike);
router.route("/").get(getLikedVideos);

export default router