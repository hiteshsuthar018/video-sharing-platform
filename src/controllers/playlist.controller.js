import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist
    const { name, description } = req.body
    if (!name || !description) {
        throw new ApiError(400, "All fields are required");
    }
    try {
        const playList = await Playlist.create({
            name,
            description,
            owner: req.user
        })
        res.status(200)
            .json(new ApiResponse(200, playList, "Playlist created successfully"))
    } catch (error) {
        console.error('Error creating PLaylist:', error);
        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Not a valid User");
    }

    try {
        const playLists = await Playlist.find({ owner: userId });
        res.status(200)
            .json(new ApiResponse(200, playLists, "Playlists fetched successfully"))
    } catch (error) {
        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Not a valid Playlist")
    }
    try {
        const playList = await Playlist.findById(playlistId);
        res.status(200)
            .json(new ApiResponse(200, playList, "Playlist fetched successfully"))

    } catch (error) {
        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Something is missing");
    }
    const playList = await Playlist.findById(playlistId);
    if (!playList) {
        throw new ApiError(400, "playList is missing");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "video is missing");
    }
    try {
        playList.videos.push(video);
        await playList.save({ validateBeforeSave: false });
        res.status(200)
            .json(new ApiResponse(200, playList, "video added to playlist successfully"))
    } catch (error) {
        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Something is missing");
    }
    const playList = await Playlist.findById(playlistId);
    if (!playList) {
        throw new ApiError(400, "playList is missing");
    }
    const video = await playList.videos.find(video => video._id.equals(videoId));
    if (!video) {
        throw new ApiError(400, "video is missing");
    }
    try {
        const videoIndex = playList.videos.indexOf(video);
        if (videoIndex > -1) {
            playList.videos.splice(videoIndex, 1);
            await playList.save({ validateBeforeSave: false });
        }
        res.status(200)
            .json(new ApiResponse(200, playList, "video Deleted from playList successfully"))
    } catch (error) {
        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Not a valid Playlist")
    }
    try {
        const playList = await Playlist.findByIdAndDelete(playlistId);
        res.status(200)
            .json(new ApiResponse(200, playList, "Playlist deleted successfully"))

    } catch (error) {
        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Not a valid Playlist")
    }
    //TODO: update playlist
    const { name, description } = req.body
    if (!name || !description) {
        throw new ApiError(400, "All fields are required");
    }
    try {
        const playList = await Playlist.findByIdAndUpdate(playlistId, {
            $set: {
                name,
                description,
                owner: req.user
            }
        },
            { new: true }
        )
        res.status(200)
            .json(new ApiResponse(200, playList, "Playlist updated successfully"))
    } catch (error) {
        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}