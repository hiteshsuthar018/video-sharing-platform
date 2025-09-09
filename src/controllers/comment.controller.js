import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            collation: { locale: 'en' } // Optional, for case-insensitive sorting
        };


        // const comments = await Comment.aggregatePaginate(aggregateOptions);
        const myAggregate = Comment.aggregate([
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "comment",
                    as: "likes"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    likedCount: { $sum: { $size: "$likes" } },
                    comments: { $first: "$$ROOT" }
                }
            },
            {
                $addFields: {
                    isLiked: {
                        $cond: {
                            if: { $in: [req.user?._id, "$comments.likes.likedBy"] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    _id: "$comments._id",
                    owner: "$comments.owner",
                    content: "$comments.content",
                    likedCount: 1,
                    isLiked: 1
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                'username': 1,
                                'avatar': 1
                            }
                        }
                    ]
                }
            }
        ]);
        

        const comments = await Comment.aggregatePaginate(myAggregate, options);

        res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"));
    } catch (error) {
        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }
});


const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "something is missing")
    }
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "comment can not be Null")
    }
    const video = await Video.findById(videoId);
    try {
        const comment = await Comment.create({
            content,
            video,
            owner: req.user
        })
        res.status(200).json(new ApiResponse(200, comment, "comments added successfully"));

    } catch (error) {
        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }


})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "something is missing")
    }
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "comment can not be Null")
    }
    try {
        const comment = await Comment.findByIdAndUpdate(commentId,
            {
                $set: {
                    content
                }
            },
            {
                new: true
            })
        res.status(200).json(new ApiResponse(200, comment, "comments updated successfully"));

    } catch (error) {

        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }



})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "something is missing")
    }

    try {
        const comment = await Comment.findByIdAndDelete(commentId)
        res.status(200).json(new ApiResponse(200, comment, "comments deleted successfully"));

    } catch (error) {
        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}