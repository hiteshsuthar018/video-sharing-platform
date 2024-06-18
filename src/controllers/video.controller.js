import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { durationOfVideo, extractThumbnail } from "../../video_Tool/videoTool.js"



// Define your controller functions
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // Validate query parameters
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedPage) || isNaN(parsedLimit) || parsedPage < 1 || parsedLimit < 1) {
        throw new ApiError(400, "Invalid page or limit value");
    }

    // Validate sortType
    const validSortTypes = ['asc', 'desc'];
    if (sortType && !validSortTypes.includes(sortType)) {
        throw new ApiError(400, "Invalid sortType value");
    }

    // Define initial aggregation pipeline stages
    const pipeline = [];
    // Add match stage for query
    if (query) {
        // Manually sanitize query to prevent injection
        const sanitizedQuery = query.replace(/[&<>"']/g, ''); // Replace special characters
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: sanitizedQuery, $options: 'i' } }, // Case-insensitive title search
                    { 'owner.username': { $regex: sanitizedQuery, $options: 'i' } } // Case-insensitive username search
                ]
            }
        });
    }
    // Add sort stage
    if (sortBy) {
        const sortStage = {};
        sortStage[sortBy] = sortType === 'desc' ? -1 : 1;
        pipeline.push({ $sort: sortStage });
    }

    const skip = (parsedPage - 1) * parsedLimit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parsedLimit });

    try {
        // Execute aggregation pipeline with pagination
        const { docs, totalDocs } = await Video.aggregatePaginate(pipeline);
        res.status(200).json(new ApiResponse(200, { docs, totalDocs }, "Videos fetched successfully"));
    } catch (err) {
        console.error("Error fetching videos:", err);
        throw new ApiError(500, "Error fetching videos");
    }
})




const publishAVideo = asyncHandler(async (req, res) => {
    //extract title and description from body
    const { title, description } = req.body;
    //extract the path of video which is uploaded on local path by multer
    const videoLocalPath = req.file?.path;
    //error handling
    if (!videoLocalPath) {
        throw new ApiError(400, "video file is required");
    }
    // Get video duration
    let duration;
    durationOfVideo(videoLocalPath)
        .then((data) => {
            duration = data;
        })
    if (duration < 1) {
        throw new ApiError(400, "video is not appropriate");
    }
    // Get thumbnail path
    try {
        extractThumbnail(videoLocalPath, 4);
    } catch (error) {
        throw new ApiError(400, error);
    }
    // Upload video and thumbnail to cloudinary

    const thumbnail = await uploadOnCloudinary("public\\temp\\thumbnail.png");
    if (!thumbnail) {
        throw new ApiError(400, "thumbnail is required");
    }
    const videoPath = await uploadOnCloudinary(videoLocalPath, "video");
    if (!videoPath) {
        throw new ApiError(400, "video file is required");
    }
    // Create video object
    const video = await Video.create({
        videoFile: videoPath?.url,
        thumbnail: thumbnail?.url,
        title,
        description,
        duration: duration,
        owner: req.user // Assuming req.user contains owner details
    });
    const videoFile = Video.findById(video?._id);
    if (!videoFile) {
        throw new ApiError(500, "something went wrong while uploading video")
    }
    res.status(200).json(new ApiResponse(200, video, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    let video;
    try {
        await Video.findByIdAndUpdate(videoId,
            { $inc: { views: 1 } }, // Increment views by 1
            { new: true }
        )
        video = await Video.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likers",
                    pipeline: [
                        {

                            $lookup: {
                                from: "users",
                                localField: "likedBy",
                                foreignField: "_id",
                                as: "likedBy",
                                pipeline: [
                                    {
                                        $project: {
                                            "fullName": 1,
                                            "avatar": 1
                                        }
                                    }
                                ]
                            }

                        },
                        {
                            $project: {
                                "likedBy": 1
                            }
                        }
                    ]
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
                                "fullName": 1,
                                "avatar": 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    likedCount: {
                        $size: "$likers"
                    },
                    isLiked: {
                        $cond: {
                            if: { $in: [req.user?._id, "$likers.likedBy"] },
                            then: true,
                            else: false
                        }
                    }
                }
            }
        ]);

    } catch (err) {
        throw new ApiError(500, "Error fetching video");
    }

    if (video.length === 0) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, video[0], "Video fetched successfully"));
})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "something went wrong");
    }
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body;
    if (!title || !description) {
        throw new ApiError(400, "all fields are required")
    }
    const thumbnailLocalPath = req.file?.path
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail file is missing");
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
        throw new ApiError(400, "thumbnail file is missing");
    }
    //find the video by id
    const video = await Video.findById(videoId);
    //error checking
    if (!video) {
        throw new ApiError(400, "video is not available");
    }
    if (!video.thumbnail) {
        throw new ApiError(400, "video thumbnail is not available")
    }
    //delete old thumbnail from cloudinary
    deleteFromCloudinary(video.thumbnail);
    //change all thing to new
    video.thumbnail = thumbnail.url
    video.title = title
    video.description = description
    //save
    await video.save({ validateBeforeSave: false }); //some error occurs in line
    //sending a response
    res.status(200).json(new ApiResponse(200, video, "all fields changed successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "something went wrong");
    }
    //TODO: delete video
    const video = await Video.findByIdAndDelete(videoId);
    
    if (!video) {
        throw new ApiError(400, "video is not available")
    }
    //delete all comments and like of video
    await Comment.findOneAndDelete({video:videoId});
    await Like.findOneAndDelete({video:videoId});

    await deleteFromCloudinary(video.videoFile, "video");
    await deleteFromCloudinary(video.thumbnail);
    
    res.status(200)
        .json(new ApiResponse(200, video, "video delete successfully"));
})

// const togglePublishStatus = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
// })

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    // togglePublishStatus
}