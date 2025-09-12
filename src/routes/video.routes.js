import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, updateVideo } from "../controllers/video.controller.js";
const router = Router();

// Public routes (no authentication required)
router.route("/").get(getAllVideos) // Get all videos - public
router.route("/:videoId").get(getVideoById) // Get video by ID - public

// Protected routes (authentication required)
router.use(verifyJWT);
router.route("/").post(upload.single("video"), publishAVideo) // Publish video - protected
router.route("/:videoId")
.patch(upload.single("thumbnail"), updateVideo) // Update video - protected
.delete(deleteVideo) // Delete video - protected

export default router