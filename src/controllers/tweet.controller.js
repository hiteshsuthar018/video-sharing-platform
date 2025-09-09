import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    try {
        const { content } = req.body;
        console.log(content);
        
        if (!content) {
            throw new ApiError(400, "Content is missing.");
        }

        const tweet = await Tweet.create({
            content,
            owner: req.user
        });

        if (!tweet) {
            throw new ApiError(400, "Failed to create tweet.");
        }

        res.status(200).json(new ApiResponse(200, tweet, "Tweet published successfully."));
    } catch (error) {
        // Handle unexpected errors
        console.error('Error creating tweet:', error);
        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }
});


const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "something went wrong")
    }

    try {
        const tweet = await Tweet.aggregate([{
            $match:{
               owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
            }
        },
        {
          $lookup:{
            from:"likes",
            localField:"_id",
            foreignField:"tweet",
            as:"likers"
          }
        },
        {  
            $addFields:{
                likedCount:{
                    $size:"$likers"
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likers.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                "owner.fullName":1,
                "owner.avatar":1,
                "content":1,
                "likedCount":1,
                "isLiked":1
            }
        }
    ]);

        res.status(200)
            .json(new ApiResponse(200, tweet, "tweet fetched successfully"))
    } catch (error) {
        throw new ApiError(500, error.message || "something went wrong")
    }

})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Not a valid tweet")
    }
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Tweet can not be Null")
    }
    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        }
        , { new: true }
    )
    return res.status(200)
        .json(new ApiResponse(200, tweet, "tweet updated successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Not a valid tweet");
    }
    const tweet = await Tweet.findByIdAndDelete(tweetId);
    if (!tweet) {
        throw new ApiError(500, "something went wrong");
    }

    return res.status(200)
        .json(new ApiResponse(200, tweet, "tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}