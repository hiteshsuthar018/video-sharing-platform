import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const totalVideoView = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $group:null,
            totalViews:{
                
            }
        }
    ])
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);
    try {
        const videos = await User.find({ owner: user});
        res.status(200).json(
            new ApiResponse(200, videos, "videos fetched successfully")
        )
    } catch (error) {
        throw new ApiError(500, error.message || "something went wrong")
    }

})

export {
    getChannelStats,
    getChannelVideos
}