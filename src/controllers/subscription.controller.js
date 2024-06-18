import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"



const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Not a valid channel Id")
    }
    const isSubscriber = await Subscription.find({
        subscriber: req.user,
        channel: channelId
    })
    try {
        if (!(isSubscriber.length) > 0) {
            const subscription = await Subscription.create({
                subscriber: req.user,
                channel: channelId
            })
            res.status(200).json(new ApiResponse(200, subscription, "channel subscribed successfully"))
        }
        else {
            await Subscription.deleteOne({
                channel: channelId,
                subscriber: req.user
            })
            res.status(200).json(new ApiResponse(200, {}, "channel unsubscribed successfully"))
        }
    } catch (error) {
        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Not a valid channel Id");
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users", // Collection name should be lowercase
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber"
            }
        },
        {
            $unwind: "$subscriber" // Since $lookup produces an array, unwind to destructure it
        },
        {
            $project: { // Project only required fields
                "subscriber.fullName": 1,
                "subscriber.username": 1,
                "subscriber.avatar": 1
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, subscribers, "All subscribers fetched successfully"));
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Not a valid channel Id");
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users", // Collection name should be lowercase
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel"
            }
        },
        {
            $unwind: "$subscribedChannel" // Since $lookup produces an array, unwind to destructure it
        },
        {
            $project: { // Project only required fields
                "subscribedChannel.fullName": 1,
                "subscribedChannel.username": 1,
                "subscribedChannel.avatar": 1
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, subscribedChannels, "All subscribed channel fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}