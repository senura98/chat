import express from "express"
import { login,logout,signup } from "../controllers/auth.contoller.js"
import { protectRoute } from "../middleware/auth.middleware.js"
import { updateProfile } from "../controllers/auth.contoller.js"
import { check } from "../controllers/auth.contoller.js"

const router = express.Router()

router.post("/signup",signup)

router.post("/login",login)

router.post("/logout",logout)

router.put("/update-profile",protectRoute,updateProfile)
router.get("/check",protectRoute,check)

export default router
