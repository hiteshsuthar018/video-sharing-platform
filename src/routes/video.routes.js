import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, updateVideo } from "../controllers/video.controller.js";
const router = Router();
router.use(verifyJWT);


// publish a new video
router.route("/").post(upload.single("video"), publishAVideo).get(getAllVideos)
router.route("/:videoId")
.get(getVideoById)
.patch(upload.single("thumbnail"), updateVideo)
.delete(deleteVideo)

export default router