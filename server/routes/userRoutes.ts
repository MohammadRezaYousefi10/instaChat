import { Router } from "express";
import { deleteAccount, deleteProfileImage, getProfile, getUsers, searchUsers, syncPhone, updateProfile } from "../controllers/userController.js";
import upload from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/auth.js";


const userRouter = Router();

userRouter.use(authMiddleware)

userRouter.get('/' , getUsers)

userRouter.get('/search' , searchUsers)

userRouter.get('/profile'  , getProfile)

userRouter.put('/profile' , upload.single("avatar") , updateProfile)

userRouter.delete('/avatar' , deleteProfileImage)

userRouter.delete('/me' , deleteAccount)

userRouter.post("/sync-phone", syncPhone);

export default userRouter