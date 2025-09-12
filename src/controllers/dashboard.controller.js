import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    try {
        const totalVideoViews = await Video.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: "$views" },
                    totalVideos: { $sum: 1 }
                }
            }
        ]);

        const totalSubscribers = await Subscription.aggregate([
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $count: "totalSubscribers"
            }
        ]);

        const totalLikes = await Like.aggregate([
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "video"
                }
            },
            {
                $match: {
                    "video.owner": new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $count: "totalLikes"
            }
        ]);

        const stats = {
            totalViews: totalVideoViews[0]?.totalViews || 0,
            totalVideos: totalVideoViews[0]?.totalVideos || 0,
            totalSubscribers: totalSubscribers[0]?.totalSubscribers || 0,
            totalLikes: totalLikes[0]?.totalLikes || 0
        };

        res.status(200).json(
            new ApiResponse(200, stats, "Channel stats fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while fetching channel stats");
    }
})

const getChannelVideos = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        };

        const videos = await Video.aggregatePaginate(
            Video.aggregate([
                {
                    $match: {
                        owner: new mongoose.Types.ObjectId(req.user?._id)
                    }
                },
                {
                    $lookup: {
                        from: "likes",
                        localField: "_id",
                        foreignField: "video",
                        as: "likes"
                    }
                },
                {
                    $addFields: {
                        likeCount: { $size: "$likes" }
                    }
                },
                {
                    $project: {
                        title: 1,
                        description: 1,
                        thumbnail: 1,
                        videoFile: 1,
                        duration: 1,
                        views: 1,
                        likeCount: 1,
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ]),
            options
        );

        res.status(200).json(
            new ApiResponse(200, videos, "Channel videos fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while fetching channel videos");
    }
})

export {
    getChannelStats,
    getChannelVideos
}