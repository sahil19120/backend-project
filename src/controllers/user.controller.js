import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models//user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accesstoken = user.generateAccessToken()
        const refreshtoken = user.generateRefreshToken()

        user.refreshtoken = refreshtoken
        await user.save({validateBeforeSave : false})

        return {accesstoken, refreshtoken}

    } catch (error) {
        throw new ApiError(500, " something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user detail from frontend
    // validation - not empty
    // check if user already exist : username,email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response


    const{fullName,email,username,password} = req.body
    //console.log("email : ", email);  

    if(
        [fullName,email,username,password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "all field are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "user with email or username exists already")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;

    //const coverImageLocalPath = req.field?.coverImage[0]?.path;

    let coverImageLocalPath
    if(req.files && Array.array(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "upload avatar file it is required")
    }
     
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage=  await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, " avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, " something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )

})

/* -------  login logic for here ----- */

const loginUser = asyncHandler(async(req,res) => {
    //req body -> data
    // username or email
    // find the user
    // password check
    // access and referesh token
    //send cookie

    const {email, username,password} = req.body

    if(
        !username || !email
    ){
        throw new ApiError(400, "usermame or password is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user){
        throw new ApiError(404, "user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "password is wrong")
    }

    const {accesstoken, refreshtoken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshtoken")

    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accesstoken, options)
    .cookie("refreshToken", refreshtoken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser ,accesstoken, refreshtoken
            },
            "user logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshtoken: undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out"))
})

export {
    registerUser,
    loginUser,
    logoutUser
}