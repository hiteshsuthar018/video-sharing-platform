import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Not a valid channel Id")
    }
    const isLiked = await Like.find({
        likedBy:req.user,
        video:videoId
    })
    try {
        if (!(isLiked.length) > 0) {
            const like = await Like.create({
                likedBy:req.user._id,
                video:videoId
            })
            res.status(200).json(new ApiResponse(200, like, "video Liked successfully"))
        }
        else {
            await Like.deleteOne({
                likedBy:req.user._id,
                video:videoId
            })
            res.status(200).json(new ApiResponse(200, {}, "video Disliked successfully"))
        }
    } catch (error) {
        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Not a valid comment Id")
    }
    const isLiked = await Like.find({
        likedBy:req.user,
        comment:commentId
    })
    try {
        if (!(isLiked.length) > 0) {
            const like = await Like.create({
                likedBy:req.user._id,
                comment:commentId
            })
            res.status(200).json(new ApiResponse(200, like, "comment Liked successfully"))
        }
        else {
            await Like.deleteOne({
                likedBy:req.user._id,
                comment:commentId
            })
            res.status(200).json(new ApiResponse(200, {}, "comment Disliked successfully"))
        }
    } catch (error) {
        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Not a valid comment Id")
    }
    const isLiked = await Like.find({
        likedBy:req.user,
        tweet:tweetId
    })
    try {
        if (!(isLiked.length) > 0) {
            const like = await Tweet.create({
                likedBy:req.user._id,
                tweet:tweetId
            })
            res.status(200).json(new ApiResponse(200, like, "tweet Liked successfully"))
        }
        else {
            await Like.deleteOne({
                likedBy:req.user._id,
                tweet:tweetId
            })
            res.status(200).json(new ApiResponse(200, {}, "tweet Disliked successfully"))
        }
    } catch (error) {
        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
   try {
     const videos = await Like.aggregate([
         {
             $match:{
                 likedBy: new mongoose.Types.ObjectId(req.user._id),
                 video: { $exists: true }
             }
         },
         {
             $lookup:{
                 from:"videos",
                 localField:"video",
                 foreignField:"_id",
                 as:"video",
                 pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
             }
         },
         {
            $project:{
                "video.thumbnail": 1,
                "video.title": 1,
                "video.duration": 1,
                "video.owner": 1,
                "video.views": 1,
                "video.createdAt": 1,
            }
         }
         
     ])
     res.status(200).json(new ApiResponse(200,videos,"All liked videos fetched successfully"));
   } catch (error) {
    res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));

   }
    
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}