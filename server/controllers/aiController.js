import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { GoogleGenAI } from "@google/genai";
//import Replicate from "replicate";
import PptxGenJS from "pptxgenjs";
import path from "path";
//import { YoutubeTranscript } from "youtube-transcript";
import { Innertube } from 'youtubei.js';
import mammoth from "mammoth";



const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message:
          "You have exhausted your free usage. Please upgrade to premium plan.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId},${prompt},${content},'article')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message:
          "You have exhausted your free usage. Please upgrade to premium plan.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId},${prompt},${content},'blog-title')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message:
          "This feature is only available for premium subscriptions. Please upgrade to premium plan.",
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    //console.log(formData.get('prompt'));
    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(
      data,
      "binary"
    ).toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64Image);
    //console.log(uploadResult);
    const { secure_url } = uploadResult;

    await sql` INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId},${prompt},${secure_url},'image', ${
      publish ?? false
    })`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message || "Unknown error" });
  }
};

export const generateVideo = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message:
          "This feature is only available for premium subscriptions. Please upgrade to premium plan.",
      });
    }

    console.log("Starting video generation for user:", userId);
    console.log("Prompt:", prompt);

    // Generate base image with ClipDrop
    console.log("Step 1: Generating base image...");

    const formData = new FormData();
    formData.append("prompt", prompt);

    const imageResponse = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(
      imageResponse.data,
      "binary"
    ).toString("base64")}`;

    // Upload original image to Cloudinary
    const imageUploadResult = await cloudinary.uploader.upload(base64Image, {
      resource_type: "image",
      folder: "ai-images",
    });

    console.log("Base image uploaded:", imageUploadResult.secure_url);

    // Step 2: Create multiple frames for animation using Cloudinary transformations
    console.log("Step 2: Creating animated frames...");

    const frames = [];
    const transformations = [
      // Frame 1: Original
      { angle: 0, effect: "brightness:0" },
      // Frame 2: Slight zoom in
      { width: 1.1, height: 1.1, crop: "scale", effect: "brightness:10" },
      // Frame 3: More zoom + slight rotation
      {
        width: 1.2,
        height: 1.2,
        crop: "scale",
        angle: 2,
        effect: "brightness:20",
      },
      // Frame 4: Peak zoom
      {
        width: 1.3,
        height: 1.3,
        crop: "scale",
        angle: 3,
        effect: "brightness:30",
      },
      // Frame 5: Zoom out
      {
        width: 1.2,
        height: 1.2,
        crop: "scale",
        angle: 2,
        effect: "brightness:20",
      },
      // Frame 6: Back to normal
      {
        width: 1.1,
        height: 1.1,
        crop: "scale",
        angle: 1,
        effect: "brightness:10",
      },
      // Frame 7: Original
      { angle: 0, effect: "brightness:0" },
    ];

    for (let i = 0; i < transformations.length; i++) {
      const frameUrl = cloudinary.url(imageUploadResult.public_id, {
        resource_type: "image",
        transformation: transformations[i],
        format: "jpg",
      });
      frames.push(frameUrl);
    }

    // Step 3: Create video from frames using Cloudinary's video creation
    console.log("Step 3: Creating video from frames...");

    // Create a video by uploading the first frame and then creating an animated version
    const videoResult = await cloudinary.uploader.upload(
      imageUploadResult.secure_url,
      {
        resource_type: "video",
        folder: "ai-videos",
        transformation: [
          // Create a slow zoom animation
          {
            width: 1280,
            height: 720,
            crop: "fill",
            gravity: "center",
          },
          {
            effect: "loop:3", // Loop 3 times
            flags: "animated",
          },
          {
            // Add a subtle zoom effect
            transformation: [
              { width: "1.0", crop: "scale", duration: "1.0" },
              { width: "1.1", crop: "scale", duration: "1.0" },
              { width: "1.0", crop: "scale", duration: "1.0" },
            ],
          },
        ],
        format: "mp4",
        video_codec: "h264",
        bit_rate: "1m",
        fps: 24,
      }
    );

    // If that fails, create a simpler video
    if (!videoResult.secure_url) {
      console.log(
        "Complex video creation failed, creating simple animated version..."
      );

      // Create a simple GIF first
      const gifResult = await cloudinary.uploader.upload(
        imageUploadResult.secure_url,
        {
          resource_type: "image",
          folder: "ai-videos",
          transformation: [
            { width: 1280, height: 720, crop: "fill" },
            { effect: "loop", delay: 200 },
            { flags: "animated" },
          ],
          format: "gif",
        }
      );

      // Then convert GIF to MP4
      const mp4Result = await cloudinary.uploader.upload(gifResult.secure_url, {
        resource_type: "video",
        folder: "ai-videos",
        format: "mp4",
      });

      var finalVideoUrl = mp4Result.secure_url;
    } else {
      var finalVideoUrl = videoResult.secure_url;
    }

    console.log("Final video URL:", finalVideoUrl);

    // Clean up temporary image
    await cloudinary.uploader.destroy(imageUploadResult.public_id);

    // Store in database
    await sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${finalVideoUrl}, 'video', ${
      publish ?? false
    })`;

    console.log("Video generation completed successfully");

    res.json({
      success: true,
      content: finalVideoUrl,
      message: "Video created successfully!",
    });
  } catch (error) {
    console.error("Video generation error:", error);

    let userMessage = "Video generation failed. Please try again.";

    if (error.message.includes("ClipDrop")) {
      userMessage =
        "Image generation failed. Please check your ClipDrop API key.";
    } else if (error.message.includes("Cloudinary")) {
      userMessage =
        "Video processing failed. Please check your Cloudinary configuration.";
    } else if (error.message.includes("timeout")) {
      userMessage = "Video generation timed out. Please try a shorter prompt.";
    }

    res.json({
      success: false,
      message: userMessage,
    });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message:
          "This feature is only available for premium subscriptions. Please upgrade to premium plan.",
      });
    }

    const uploadResult = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background",
        },
      ],
    });
    //console.log(uploadResult);
    const { secure_url } = uploadResult;

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId},'Remove background from Image',${secure_url},'image')`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message || "Unknown error" });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message:
          "This feature is only available for premium subscriptions. Please upgrade to premium plan.",
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId},${`Remove ${object} from Image`},${imageUrl},'image')`;

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message || "Unknown error" });
  }
};

export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message:
          "This feature is only available for premium subscriptions. Please upgrade to premium plan.",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume File size exceeds.Keep the file size under 5MB.",
      });
    }

    let extractedText = "";
    const fileExtension = path.extname(resume.originalname).toLowerCase();

    if (fileExtension === ".pdf") {
      const dataBuffer = fs.readFileSync(resume.path);
      const data = await pdf(dataBuffer);
      extractedText = data.text;
    } else if (fileExtension === ".docx" || fileExtension === ".doc") {
      const { value } = await mammoth.extractRawText({ path: resume.path });
      extractedText = value;
    } else {
      fs.unlinkSync(resume.path); // Clean up uploaded file
      return res.json({
        success: false,
        message: "Unsupported file type. Please upload a PDF, DOC, or DOCX file.",
      });
    }

    // Clean up the uploaded file after processing
    fs.unlinkSync(resume.path);

    if (!extractedText.trim()) {
      return res.json({ success: false, message: "Could not extract text from the resume. The file might be empty or corrupted." });
    }
    const prompt = `Review the following resume and provide constructive feedback on its strengths, weakness, and areas for improvement. Resume Content:\n\n${extractedText}`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId},'Review the uploaded Resume',${content},'resume-review')`;

    res.json({ success: true, content });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path); // Ensure cleanup on error
    console.log(error.message);
    res.json({ success: false, message: error.message || "Unknown error" });
  }
};

export const generatePPTX = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message:
          "This feature is only available for premium subscriptions. Please upgrade to premium plan.",
      });
    }

    // 1️⃣ Generate PPT outline from Gemini AI
    const aiResponse = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: `Create a structured PowerPoint presentation outline for: "${prompt}". 
          Include 5-7 slides with titles and bullet points for each slide. 
          Respond ONLY with a JSON array, no markdown formatting, no explanations.
          Format:
          [
            { "title": "Slide 1 title", "points": ["point1","point2","point3"] },
            { "title": "Slide 2 title", "points": ["point1","point2","point3"] }
          ]`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    let slidesDataRaw = aiResponse.choices[0].message.content;
    let slidesData;

    try {
      let cleanedData = slidesDataRaw.trim();

      if (cleanedData.startsWith("```")) {
        cleanedData = cleanedData
          .replace(/```json\n?/g, "")
          .replace(/```/g, "");
      }

      const jsonMatch = cleanedData.match(/\[[\s\S]*\]/);
      if (jsonMatch) cleanedData = jsonMatch[0];

      slidesData = JSON.parse(cleanedData);

      if (!Array.isArray(slidesData) || slidesData.length === 0)
        throw new Error("Invalid slides data structure");

      for (const slide of slidesData) {
        if (!slide.title || !Array.isArray(slide.points))
          throw new Error("Invalid slide structure");
      }
    } catch (e) {
      console.error("Parse error:", e.message, "\nRaw response:", slidesDataRaw);
      return res.json({
        success: false,
        message: "Failed to parse AI response. Please try again.",
      });
    }

    // 2️⃣ Create PowerPoint using PptxGenJS
    const pptx = new PptxGenJS();
    pptx.author = "AI Content Generator";
    pptx.title = prompt;
    pptx.subject = "AI Generated Presentation";
    pptx.layout = "LAYOUT_WIDE"; // 16:9
    pptx.defineLayout({ name: "CUSTOM", width: 10, height: 5.625 });

    slidesData.forEach((slideData, index) => {
      const slide = pptx.addSlide();

      // Slide number
      slide.addText(`${index + 1}`, {
        x: 9.2,
        y: 5.0,
        w: 0.5,
        h: 0.3,
        fontSize: 10,
        color: "999999",
        align: "right",
      });

      // Title with rectangle background
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fill: { type: "solid", color: "4A7AFF" },
        line: { type: "none" },
      });

      slide.addText(slideData.title, {
        x: 0.6,
        y: 0.55,
        w: 8.8,
        h: 0.7,
        fontSize: 32,
        bold: true,
        color: "FFFFFF",
        valign: "middle",
      });

      // Bullet points
      const bullets = slideData.points.map((point) => ({
        text: point,
        options: { bullet: true, indentLevel: 0 },
      }));

      slide.addText(bullets, {
        x: 0.8,
        y: 1.8,
        w: 8.4,
        h: 3.2,
        fontSize: 18,
        color: "333333",
        valign: "top",
        bullet: { code: "2022" },
      });

      // Decorative line
      slide.addShape(pptx.ShapeType.line, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 0,
        line: { color: "4A7AFF", width: 2 },
      });
    });

    // 3️⃣ Determine temp folder based on environment
    const isVercel = !!process.env.VERCEL;
    const tempDir = isVercel
      ? path.join("/tmp", "QuickAI")
      : path.join(process.cwd(), "temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `AI_Presentation_${Date.now()}.pptx`;
    const tempPath = path.join(tempDir, fileName);

    // 4️⃣ Save PPT locally (temporary)
    await pptx.writeFile({ fileName: tempPath });
    console.log("PPTX file created:", tempPath);

    // 5️⃣ Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(tempPath, {
      resource_type: "raw",
      folder: "ai-presentations",
      public_id: fileName.replace(".pptx", ""),
      format: "pptx",
    });

    const permanentUrl = uploadResult.secure_url;
    console.log("Uploaded to Cloudinary:", permanentUrl);

    // 6️⃣ Clean up temp file
    fs.unlinkSync(tempPath);

    // 7️⃣ Save record to database
    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${permanentUrl}, 'ppt')`;

    res.json({
      success: true,
      content: permanentUrl,
      fileName,
      slideCount: slidesData.length,
      message: "AI-generated PPTX created successfully!",
    });
  } catch (error) {
    console.error("generatePPTX error:", error.message);
    res.json({
      success: false,
      message: error.message || "Failed to generate PPT.",
    });
  }
};








const userContentCache = new Map();

// Helper function to split large content into manageable chunks
const chunkContent = (text, maxChunkSize = 18000) => {
  const chunks = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentChunk = "";
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
};

export const loadStudyMaterial = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { youtubeUrl, websiteUrl, sourceType } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.status(403).json({
        success: false,
        message: "This feature is only available for premium users. Please upgrade.",
      });
    }

    let extractedText = "";
    let sourceName = "";

    // Handle uploaded file (PDF/TXT/DOCX)
    if (req.file && sourceType === "pdf") {
      try {
        const filePath = req.file.path;
        const ext = path.extname(req.file.originalname).toLowerCase();
        const fileSize = req.file.size;

        // Check file size (10MB limit)
        if (fileSize > 10 * 1024 * 1024) {
          fs.unlinkSync(filePath);
          return res.status(400).json({ 
            success: false, 
            message: "File size exceeds 10MB limit." 
          });
        }

        if (ext === ".pdf") {
          const pdfBuffer = fs.readFileSync(filePath);
          const data = await pdf(pdfBuffer);
          extractedText = data.text;
        } else if (ext === ".txt") {
          extractedText = fs.readFileSync(filePath, "utf-8");
        } else if (ext === ".docx" || ext === ".doc") {
          const { value } = await mammoth.extractRawText({ path: filePath });
          extractedText = value;
        } else {
          fs.unlinkSync(filePath);
          return res.status(400).json({ 
            success: false, 
            message: "Unsupported file type. Please upload PDF, TXT, DOC, or DOCX." 
          });
        }

        sourceName = req.file.originalname;
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("File processing error:", err.message);
        if (req.file?.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ 
          success: false, 
          message: "Failed to process file." 
        });
      }
    }
    // Handle Website URL
    else if (sourceType === "weblink" && websiteUrl?.trim()) {
      try {
        const response = await axios.get(websiteUrl, { 
          timeout: 20000, 
          headers: { "User-Agent": "Mozilla/5.0" },
          maxContentLength: 20 * 1024 * 1024 // 20MB max
        });
        
        extractedText = response.data
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
          
        sourceName = websiteUrl;
      } catch (err) {
        console.error("Website fetch error:", err.message);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to fetch website content. Check the URL." 
        });
      }
    }
    // Handle YouTube URL
    else if (sourceType === "youtube" && youtubeUrl?.trim()) {
      try {
        const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        const videoId = videoIdMatch?.[1];
        
        if (!videoId) {
          return res.status(400).json({ 
            success: false, 
            message: "Invalid YouTube URL." 
          });
        }

        console.log("Fetching transcript for video:", videoId);

        const youtube = await Innertube.create();
        const info = await youtube.getInfo(videoId);
        const transcriptData = await info.getTranscript();
        
        if (!transcriptData || !transcriptData.transcript) {
          return res.status(400).json({
            success: false,
            message: "No transcript available for this video. Please try a video with captions enabled."
          });
        }

        const transcriptText = transcriptData.transcript.content.body.initial_segments
          .map(segment => segment.snippet.text)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        if (!transcriptText || transcriptText.length < 50) {
          return res.status(400).json({
            success: false,
            message: "Transcript is too short or empty. Please try a different video."
          });
        }
        
        console.log("Successfully extracted transcript:", transcriptText.length, "characters");
        extractedText = transcriptText;
        sourceName = `YouTube: ${info.basic_info.title || videoId}`;
        
      } catch (err) {
        console.error("YouTube processing error:", err);
        
        let errorMessage = "Failed to load YouTube transcript. ";
        if (err.message?.includes("not available")) {
          errorMessage += "This video doesn't have captions available.";
        } else if (err.message?.includes("private") || err.message?.includes("unavailable")) {
          errorMessage += "This video is private or unavailable.";
        } else {
          errorMessage += "Please ensure the video has captions enabled.";
        }
        
        return res.status(400).json({ 
          success: false, 
          message: errorMessage
        });
      }
    }

    // Validate we got some content
    if (!extractedText.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "No content could be extracted from the source." 
      });
    }

    // Clean and normalize text
    extractedText = extractedText
      .replace(/\s+/g, " ")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .trim();

    // Split large content into chunks
    const contentChunks = extractedText.length > 18000 
      ? chunkContent(extractedText, 18000)
      : [extractedText];

    // Store in cache with chunking info
    userContentCache.set(userId, {
      content: extractedText,
      chunks: contentChunks,
      source: sourceName,
      timestamp: Date.now(),
      totalLength: extractedText.length,
      chunkCount: contentChunks.length
    });

    // Clean up old cache entries (older than 1 hour)
    for (const [key, value] of userContentCache.entries()) {
      if (Date.now() - value.timestamp > 3600000) {
        userContentCache.delete(key);
      }
    }

    res.json({ 
      success: true, 
      source: sourceName,
      contentLength: extractedText.length,
      chunkCount: contentChunks.length,
      message: contentChunks.length > 1 
        ? `Content loaded successfully in ${contentChunks.length} parts for better processing!`
        : "Content loaded successfully!" 
    });
  } catch (err) {
    console.error("loadStudyMaterial error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to load study material. Please try again." 
    });
  }
};

export const studyAssistant = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { query, mode } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.status(403).json({
        success: false,
        message: "This feature is only available for premium users.",
      });
    }

    const cachedData = userContentCache.get(userId);
    
    if (!cachedData) {
      return res.json({ 
        success: false, 
        message: "Please load study content first." 
      });
    }

    const { content: fullContent, chunks, chunkCount } = cachedData;

    // QUIZ MODE - Use all chunks to generate comprehensive quiz
    if (mode === "quiz") {
      let quizPrompt;
      
      if (chunkCount > 1) {
        const selectedChunks = chunks.slice(0, Math.min(4, chunkCount)); // Use up to 4 chunks
        const combinedContent = selectedChunks.join("\n\n[...document continues...]\n\n");
        
        quizPrompt = `You are an expert educational assessment designer. Generate exactly 5 high-quality multiple-choice quiz questions based on the following content.

Content (shown in multiple sections):
${combinedContent.slice(0, 18000)}

CRITICAL REQUIREMENTS:

1. QUESTION QUALITY:
   - Create thoughtful questions that test genuine understanding, not just memorization
   - Cover different sections and key concepts from the content
   - Mix difficulty levels: 2 easier questions, 2 medium, 1 challenging
   - Ask about concepts, applications, and reasoning - not just definitions
   - Make questions clear and unambiguous

2. OPTIONS DESIGN:
   - Create 4 plausible options for each question
   - Make wrong answers believable (not obviously incorrect)
   - Avoid "all of the above" or "none of the above" options
   - Ensure only ONE option is definitively correct
   - Make all options roughly the same length

3. CONTENT COVERAGE:
   - Question 1-2: Core concepts/fundamentals
   - Question 3: Practical application or example
   - Question 4: Technical detail or process
   - Question 5: Advanced understanding or code-related (if applicable)

4. ANSWER ACCURACY:
   - The "answer" field must EXACTLY match one of the options (character for character)
   - Double-check that the correct answer is truly correct based on the content

Return ONLY a valid JSON array with this EXACT structure (no markdown, no explanations, no extra text):
[
  {
    "question": "Clear, specific question text?",
    "options": ["Option A description", "Option B description", "Option C description", "Option D description"],
    "answer": "Exact match to one of the options above"
  }
]

Remember: Quality over speed. Create questions that genuinely test understanding.`;
      } else {
        quizPrompt = `You are an expert educational assessment designer. Generate exactly 5 high-quality multiple-choice quiz questions based on the following content.

Content:
${fullContent.slice(0, 18000)}

CRITICAL REQUIREMENTS:

1. QUESTION QUALITY:
   - Create thoughtful questions that test genuine understanding, not just memorization
   - Cover different key concepts from the content
   - Mix difficulty levels: 2 easier questions, 2 medium, 1 challenging
   - Ask about concepts, applications, and reasoning - not just definitions
   - Make questions clear and unambiguous

2. OPTIONS DESIGN:
   - Create 4 plausible options for each question
   - Make wrong answers believable (not obviously incorrect)
   - Avoid "all of the above" or "none of the above" options
   - Ensure only ONE option is definitively correct
   - Make all options roughly the same length

3. CONTENT COVERAGE:
   - Question 1-2: Core concepts/fundamentals
   - Question 3: Practical application or example
   - Question 4: Technical detail or process
   - Question 5: Advanced understanding or code-related (if applicable)

4. ANSWER ACCURACY:
   - The "answer" field must EXACTLY match one of the options (character for character)
   - Double-check that the correct answer is truly correct based on the content

Return ONLY a valid JSON array with this EXACT structure (no markdown, no explanations, no extra text):
[
  {
    "question": "Clear, specific question text?",
    "options": ["Option A description", "Option B description", "Option C description", "Option D description"],
    "answer": "Exact match to one of the options above"
  }
]

Remember: Quality over speed. Create questions that genuinely test understanding.`;
      }

      const response = await AI.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: [{ role: "user", content: quizPrompt }],
        temperature: 0.8,
        max_tokens: 4000, // Increased for better quality questions
      });

      let quizData = response.choices[0].message.content;
      
      quizData = quizData.trim()
        .replace(/```json\n?/g, "")
        .replace(/```/g, "")
        .trim();

      await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (
        ${userId}, 
        'Generated Quiz', 
        ${quizData}, 
        'study-quiz'
      )`;

      return res.json({ 
        success: true, 
        response: quizData 
      });
    }

    // Q&A MODE - Enhanced Claude/ChatGPT level responses
    if (!query || query.trim() === "") {
      return res.json({ 
        success: false, 
        message: "Please enter a question." 
      });
    }

    let relevantContent;
    let searchStrategy = "keyword"; // default strategy
    
    // Detect if user is asking about specific pages/sections/experiments
    const pageMatch = query.match(/page\s*(?:no\.?|number)?\s*(\d+)/i);
    const expMatch = query.match(/exp(?:eriment)?\s*(?:no\.?|number)?\s*(\d+)/i);
    const sessionMatch = query.match(/session\s*(?:no\.?|number)?\s*(\d+)/i);
    const labMatch = query.match(/lab\s*(?:exercise)?\s*(?:no\.?|number)?\s*(\d+)/i);
    
    if (chunkCount > 1) {
      // Check if query is about specific location in document
      if (pageMatch || expMatch || sessionMatch || labMatch) {
        searchStrategy = "comprehensive";
        // For specific page/section queries, use more chunks to ensure coverage
        // Use first 4 chunks or all chunks if less than 4
        const numChunksToUse = Math.min(4, chunkCount);
        relevantContent = chunks.slice(0, numChunksToUse).join("\n\n[...document continues...]\n\n");
        
        console.log(`Using comprehensive strategy: ${numChunksToUse} chunks for specific page/section query`);
      } else {
        // Advanced relevance scoring for general questions
        searchStrategy = "keyword";
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
        
        const scoredChunks = chunks.map((chunk, index) => {
          const chunkLower = chunk.toLowerCase();
          
          let score = 0;
          
          // Exact phrase matching
          if (chunkLower.includes(queryLower)) score += 100;
          
          // Individual keyword frequency
          queryWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            const matches = (chunkLower.match(regex) || []).length;
            score += matches * 5;
          });
          
          // Keyword proximity
          for (let i = 0; i < queryWords.length - 1; i++) {
            const word1 = queryWords[i];
            const word2 = queryWords[i + 1];
            const proximityRegex = new RegExp(`${word1}.{0,50}${word2}`, 'g');
            const proximityMatches = (chunkLower.match(proximityRegex) || []).length;
            score += proximityMatches * 10;
          }
          
          // Position bias
          score += (chunks.length - index) * 0.5;
          
          return { chunk, score, index };
        });
        
        scoredChunks.sort((a, b) => b.score - a.score);
        
        // Use top 3 chunks for better coverage
        const topChunks = scoredChunks.slice(0, 3).sort((a, b) => a.index - b.index);
        relevantContent = topChunks.map(c => c.chunk).join("\n\n[...document continues...]\n\n");
        
        // If no good matches, use first 3 chunks
        if (scoredChunks[0].score < 5) {
          relevantContent = chunks.slice(0, 3).join("\n\n[...document continues...]\n\n");
        }
        
        console.log(`Using keyword strategy: Top 3 chunks with scores: ${scoredChunks.slice(0, 3).map(c => c.score).join(', ')}`);
      }
    } else {
      relevantContent = fullContent.slice(0, 18000);
    }

    // Enhanced prompt for Claude/ChatGPT quality responses
    const qaPrompt = `You are a world-class educational expert and study assistant with deep expertise across all academic subjects. Your goal is to provide exceptionally thorough, well-structured, and insightful answers that help students truly understand the material.

${searchStrategy === "comprehensive" ? "IMPORTANT: The content below contains multiple sections of a document. Search through ALL sections carefully to find the specific page, experiment, or section the student is asking about." : ""}

Content to analyze:
${relevantContent}

Student's Question: ${query}

Core Principles for Your Response:

1. **THOROUGH SEARCH & EXTRACTION**
   - Read through ALL provided content sections carefully
   - If the question asks about specific pages, experiments, or sections, locate them precisely
   - Extract ALL relevant information, code, examples, and context

2. **COMPREHENSIVE DEPTH**
   - Provide detailed, thorough explanations that leave no ambiguity
   - Break down complex concepts into digestible parts
   - Include background context when it helps understanding
   - Connect concepts to show the bigger picture

3. **CRYSTAL CLEAR STRUCTURE**
   - Start with a brief overview if the topic is complex
   - Use logical progression: basics first, then details
   - Organize information with clear sections using natural language markers:
     * "First, let's understand..."
     * "The main concept here is..."
     * "Breaking this down:"
     * "Key points to remember:"
     * "Here's how it works in practice:"

4. **CODE & TECHNICAL CONTENT HANDLING**
   - Include complete code snippets when relevant
   - Explain what each significant part of the code does
   - Describe the logic flow step-by-step
   - Highlight important functions, variables, and their purposes
   - Show how the code achieves its objective
   - Mention any important libraries or dependencies

5. **PRACTICAL EXAMPLES & APPLICATIONS**
   - Provide concrete examples from the content
   - Show real-world applications when possible
   - Use analogies for difficult concepts
   - Include sample outputs or expected results

6. **CLARITY & ACCESSIBILITY**
   - Write in clear, natural language without jargon overload
   - Define technical terms when first used
   - Use simple sentence structures for complex ideas
   - Make the explanation accessible to students at various levels

7. **COMPLETENESS & ACCURACY**
   - Address ALL parts of the student's question
   - Don't skip over details that might seem obvious
   - If code is present, walk through it line by line or section by section
   - If the content doesn't cover something, explicitly state: "This specific information is not covered in the provided material"

8. **EDUCATIONAL VALUE**
   - Explain not just "what" but "why" and "how"
   - Help students understand the reasoning and logic
   - Point out common pitfalls or areas of confusion
   - Suggest connections to related concepts

9. **MULTI-SECTION SYNTHESIS**
   - If information spans multiple sections (marked with [...document continues...]), synthesize it coherently
   - Connect information from different parts of the content
   - Present a unified, complete answer

10. **NATURAL FORMATTING**
    - Use natural paragraphs with proper spacing between ideas
    - For lists: use hyphens (-) with clear descriptions
    - For sequences: "Step 1:", "Step 2:", etc.
    - For code: present it plainly with proper indentation
    - NO markdown symbols (*, **, #, \`, etc.)
    - Write as if explaining to someone in person

Response Structure Guidelines:

For conceptual questions:
- Start with core definition/concept
- Provide detailed explanation
- Include examples from content
- Connect to broader context

For code explanation questions:
- State what the code does (purpose)
- Explain setup/imports
- Walk through the main logic
- Describe key functions/methods
- Show expected output/results
- Mention any important considerations

For procedural questions:
- Outline the overall process
- Break down each step clearly
- Explain why each step matters
- Include any prerequisites or requirements

Remember: You're not just answering a question - you're teaching. Make every response a complete learning experience that leaves the student with genuine understanding, not just facts.`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: qaPrompt }],
      temperature: 0.7,
      max_tokens: 10000, // Increased to 10,000 for comprehensive responses
      top_p: 0.95,
    });

    let answer = response.choices[0].message.content;
    
    // Aggressive markdown cleanup for natural text
    answer = answer
      .replace(/\*\*\*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/^#+\s+/gm, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/```[\s\S]*?```/g, (match) => {
        // Preserve code blocks but remove markdown
        return match.replace(/```.*\n?/g, '').trim();
      })
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links
      .replace(/_{2,}/g, '') // Remove underscores
      .trim();

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (
      ${userId}, 
      ${query}, 
      ${answer}, 
      'study-qa'
    )`;

    return res.json({ 
      success: true, 
      response: answer 
    });

  } catch (error) {
    console.error("Study Assistant Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error processing request: " + error.message 
    });
  }
};
