import express from "express";
import { getPublishedCreations, getUserCreations, toggleLikeCreations } from "../controllers/userController.js";

const userRouter = express.Router();

// Remove auth middleware from here since requireAuth() is applied in server.js
userRouter.get('/get-user-creations', getUserCreations);
userRouter.get('/get-published-creations', getPublishedCreations);
userRouter.post('/toggle-like-creations', toggleLikeCreations);

export default userRouter;