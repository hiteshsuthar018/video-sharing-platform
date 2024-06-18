import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
const router = Router();
router.use(verifyJWT);


// playlist routes
router.route("/").post(createPlaylist);
router.route("/user/:userId").get(getUserPlaylists)
router.route("/:playlistId").get(getPlaylistById).delete(deletePlaylist).patch(updatePlaylist)
router.route("/a/:playlistId/:videoId").patch(addVideoToPlaylist)
router.route("/r/:playlistId/:videoId").patch(removeVideoFromPlaylist)



export default router