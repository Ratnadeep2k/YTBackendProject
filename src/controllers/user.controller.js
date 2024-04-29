import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
         const user = await User.findById(userId)
        const accesToken =user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return {
            accesToken,
            refreshToken
        }
        
    } catch (error) {
        throw new ApiError(500,"Something went wrong while")
    }
}


const registerUser = asyncHandler(async(req,res)=>{
    // res.status(200).json({
    //     message:"ok"
    // })
    //get user details from frontend
    //validation- not empty
    //check if user already exist :userName,email
    //check for images ,check for avatar
    //upload them to cloudinary ,avatar
    //create user object - create entry  in db
    //remove password and refresh token field from response 
    //check for user creation
    //return res

   const {username,fullname,email,password} =req.body
   console.log("email:",email);

    if([fullname,email,username,password].
        some((field)=>field?.trim()==="")
        )
    {
        throw new ApiError(400,"All fields are required")

    }

    const existedUser = await User.findOne({
        $or:[
            {
                username
            },
            {
                email
            }
        ]
    })
    if(existedUser){
        throw new ApiError(409,"This user is already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path //multer send file
    // const coverImageLocalPath =req.files?.coverImage[0]?.path


    let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
            coverImageLocalPath =req.files?.coverImage[0]?.path 
        }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required");
        }

        const avatar =await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
         if (!avatar){
            throw new ApiError(400,"Avatar is required");
         }

        const user =  await User.create({
            fullname,
            avatar : avatar.url,
            coverImage : coverImage?.url || "",
            email,
            password,
            username :username.toLowerCase()

         })

         const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
         )

         if(!createdUser){
            throw new ApiError(500,"Something went wrong while register a User")
         }

         return res.status(201).json(
            new ApiResponse(200,createdUser,"User registered succesfully")
         )
})

const loginUser = asyncHandler(async (req,res)=>{
            // req body->data
            //username or email
            //find the user 
            //password check
            //access and refresh token
            //send  cookie
            // successfully send res

            const {email,username, password}=req.body

            if (!username || !email) {
                throw new ApiError(404,"username or email is required");
            }
           const user = await User.findOne({
                $or:[{username},{email}]
            })
            if(!user ){
                throw new ApiError(404,"User doesn't exist")
            }
            const isPasswordValid = await user.isPasswordCorrect(password)

            if(!isPasswordValid){
                throw new ApiError(404,"Invalid User");
            }
            const {accesToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);
            
}) 

export {
    registerUser,
    loginUser

}