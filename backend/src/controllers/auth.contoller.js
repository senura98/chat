import { generateToken } from '../lib/utils.js'
import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import cloudinary from '../lib/cloudinary.js'

export const signup=async (req,res)=>{
    const {fullName,email,password}=req.body
    try{
        if (!fullName || !email||!password){
            return res.status(400).json({message:"All fields must be provided"})
        }
        if (password.length<6){
            return res.status(400).json({message:"Password must be at least 6 characters"})

        }
        const user = await User.findOne({email})

        if (user) return res.status(400).json({message:"Email already exists"})

        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)

        const newUser=new User({
            fullName:fullName,
            email:email,
            password:hashedPassword
        })
        if (newUser){
            generateToken(newUser._id,res)
            await newUser.save()

            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic
            })
        }else{
            res.status(400).json({message:"Invalid user data"})

        }



    }catch (error){
        console.log('error in signup controller',error.message)
        res.status(500).json({message:'internal server error'})
    }

    
}

export const login= async (req,res)=>{
    const {email,password}=req.body
    try{
        const user=await User.findOne({email})

        if (!user){
            return res.status(400).json({message:'invalid credentials'})
        }

        const isPasswordCorrect=await bcrypt.compare(password,user.password)
        if(!isPasswordCorrect){
            return res.status(400).json({message:'invalid credentials'})
        }


        generateToken(user._id,res)
        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email,
            profilePic:user.profilePic

        })
    }catch (error){
        console.log('error in login controller',error.message)
        res.status(500).json({message:'internal server error'})

    }
}


export const logout = async(req, res) => {
    try {
      res.cookie("jwt", "", { maxAge: 0 });
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.log("Error in logout controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

export const updateProfile=async (req,res)=>{
    try{
        const {profilePic}=req.body
        const userId=req.user._id
        if(!profilePic){
            return res.status(400).json({message:"Profile pic is required"})
        }
        const base64Size = (profilePic.length * 3) / 4 - 2; // Approximate file size in bytes
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

        if (base64Size > MAX_FILE_SIZE) {
            return res.status(400).json({ message: "File size exceeds 5MB! Please upload a smaller file." });
        }

        const uploadResponse=await cloudinary.uploader.upload(profilePic)
        const updatedUser=await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true})
        res.status(200).json(updatedUser)
    }catch (error){
        console.log('error in update profile controller',error.message)
        res.status(500).json({message:'internal server error'})
    }
}


export const check=(req,res)=>{
    try{
        res.status(200).json(req.user)
    }catch (error){
        console.log("Error in checkAuth controller",error.message)
        res.status(500).json({message:"Internal Server Error"})

    }
}