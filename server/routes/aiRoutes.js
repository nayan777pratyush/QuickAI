import express from "express";
import { auth } from "../middlewares/auth.js";
import { generateArticle, generateBlogTitle, generateImage, generatePPTX, generateVideo, removeImageBackground, removeImageObject, resumeReview, studyAssistant, loadStudyMaterial } from "../controllers/aiController.js";
import { upload } from "../configs/multer.js";

const aiRouter = express.Router();

aiRouter.post('/generate-article', auth, generateArticle)
aiRouter.post('/generate-blog-title', auth, generateBlogTitle)
aiRouter.post('/generate-image', auth, generateImage)
aiRouter.post('/generate-video', auth, generateVideo)
aiRouter.post('/remove-image-background',upload.single('image'),auth, removeImageBackground)
aiRouter.post('/remove-image-object',upload.single('image'),auth, removeImageObject)
aiRouter.post('/resume-review',upload.single('resume'),auth, resumeReview)
aiRouter.post('/generate-pptx', auth, generatePPTX)
aiRouter.post('/load-study-material', auth, upload.single('file'), loadStudyMaterial);
aiRouter.post('/study-assistant-chat', auth, studyAssistant);



export default aiRouter;