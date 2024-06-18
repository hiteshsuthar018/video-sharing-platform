import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken()
        // console.log("accessToken",accessToken)
        const refreshToken = await user.generateRefreshToken()
        // console.log("refreshToken",refreshToken)
        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false }); //some error occurs in line

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh token")
    }


}

//🌟register user
const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation - not empty
    //check if user already exists: username , email
    //check for images , check for avatar
    //upload them for cloudinary, avatar 
    //create user object -  create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res


    // fullName, email, username, password  ko body se nikala
    const { fullName, email, username, password } = req.body;
    console.log("email :", email)
    //check karenge ki koi bhi data null to nhi hai
    if (
        [fullName, email, username, password].some((field) =>
            //trim ko white sapaces ko remove karne k liye use kiya jata hai.
            field?.trim() === ""
        )) {
        //agar hai to error de denge
        throw new ApiError(400, "All field are required")
    }
    //username and email ki help se check karenge ki user pahle se exist to nhi karta hai
    const existedUser = await User.findOne(
        {
            $or: [{ username }, { email }]
        }
    )
    //agar karta hai to error throw karenge
    if (existedUser) {
        throw new ApiError(409, "user with username and email already exist")
    }
    //local storage se avatar or coverImage ka path nikalenge agar vo exist karta hai to
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }

    // console.log(req.files);
    //agar exist nhi karta hai to error denge
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    //avatar and coverImage ko cloudinary pe upload karenge
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    //agar avatar file upload nhi hui to error denge
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    //new user banayenge or sari values dal denge
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),

    })
    //created user ko find karke usme se password and refreshToken ki value nikal denge
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    // agar created user nhi mila matlab vo db me nhi bana to error denge
    if (!createdUser) {
        throw new Error(500, "Something went wrong while registering a user")
    }
    // response bhej denge last me
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registred successfully")
    )
})

//🌟login user
const loginUser = asyncHandler(async (req, res) => {
    //req body->data
    //username and email
    //find the user
    //password check
    //access and refresh token
    //send cookie

    const { username, email, password } = req.body;

    //if username and email is null
    if (!username && !email) {
        throw new ApiError(400, "username and email is required");
    }

    //search a user by username or email
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    //if user does not exist throw an error
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }
    //check a password valid or not by a method
    const isPasswordValid = await user.isPasswordCorrect(password);
    //if password does not exist throw an error
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user Credentials");
    }

    //generating access and refresh Token by above mehod
    console.log("user id is", user._id);
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    //finding a user with access token and where password and refresh token is not include
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            //yeh response bhej rahe hai taki agar koi mobile app pe ho to vaha cookie nhi hoti
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged In Successfully"
            )
        )

})

//logout user
const logoutUser = asyncHandler(async (req, res) => {
    // console.log("ENTER IN LOGOUT FUNCTION")
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 //this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out")
        )

})

//refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
    //incoming refresh token lena from the cookie or body
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    //agar null hai to error throw karenge
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }
    try {

        //decode the incoming refresh token using jwt verify 
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        //decoded refresh token me user ki id se user ko find karenge
        const user = await User.findById(decodedToken?._id);
        //if user value is null to error throw karenge
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }
        //ab check karenge ki incoming jo user ka refresh token hai and usme jo user hai uska refresh token same hai ya nhi 
        //agar nhi hai to error throw karnege
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        //ab new access and refresh token generate karenge
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)


        // ab response me cookies me access token and refresh token bhej denge
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, {
                    accessToken, refreshToken: newRefreshToken
                },
                    "Access Token refreshed")
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
    }
})

//change current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false });

    return res.status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

//get current user
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "current User fetched successfully"))
})

//update account details
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }
    
   const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        }
        , { new: true }).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
})

//update avatar of user
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar");
    }

    if (!req.user?.avatar) {
        throw new ApiError(400,"avatar is missing");
    }
    // Delete old avatar from Cloudinary
    deleteFromCloudinary(req.user?.avatar);
    
    await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")
    return res
        .status(200)
        .json(new ApiResponse(200, user, "avatar image updated successfully"))

})
//update cover image
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on cover Image");
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover image updated successfully"))
})

//getting channel profile of user
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }

    const channel = await User.aggregate(
        [
            {
                $match: {
                    username: username?.toLowerCase()
                }
            },
            {
                //jitne mere channel or subscriber ka pair hoga utne hi hamare total subscribers honge
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            //jitne pairs me mai subscriber hounga utne me subscribedTo honge
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscriberCount: {
                        $size: "$subscribers"
                    },
                    channelsSubscribedToCount: {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    fullName: 1,
                    username: 1,
                    subscriberCount: 1,
                    channelsSubscribedToCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1
                }
            }
        ]
    )
    // channel ek array hai jisme hamare pass ek object hai
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exist");
    }
    return res
        .status(200)
        //to hum yaha par array ka first object bhejenge
        .json(new ApiResponse(200, channel[0], "User channel fetched successfully"))
})

//getting watch history of user
const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHisotry",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "user",
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
        }
    ]
    )
    return res
        .status(200)
        .json(
            new ApiResponse
                (
                    200,
                    user[0].watchHistory,
                    "Watch History fetched successfully"
                )
        )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}
