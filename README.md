<p align="center">
  <img src="client/src/assets/webpic.png" alt="QuickAI Banner" width="100%">
</p>

---
<!-- Live demo link for QuickAI -->
<p align="center">
  <a href="https://quick-ai-two-swart.vercel.app/ai" target="_blank" rel="noopener noreferrer">
    <img alt="QuickAI - Live Demo" src="https://img.shields.io/badge/Live%20Demo-QuickAI-brightgreen?style=for-the-badge&logo=vercel" />
  </a>
</p>

<h1 align="center">🚀 QuickAI — Try the Live Demo</h1>

<p align="center">
  <a href="https://quick-ai-two-swart.vercel.app/ai" target="_blank" rel="noopener noreferrer">
    <img alt="Open QuickAI" src="https://img.shields.io/badge/Open%20QuickAI-%23007ACC?style=for-the-badge&logo=google-chrome&logoColor=white" />
  </a>
</p>

<p align="center">
  <strong>Click the button above</strong> to open the deployed app — explore AI-powered tools like Presentation Maker, Image & Video generation, Resume review and more. ✨
</p>

---

<h1 align="center">
  <img src="client/src/assets/favicon.svg"> QuickAI – All-in-One AI SaaS for Content, Learning & Productivity
</h1>

<p align="center">
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/Made%20with-React-blue?logo=react&style=for-the-badge" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Backend-Node.js-green?logo=node.js&style=for-the-badge" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql&style=for-the-badge" /></a>
  <a href="https://www.figma.com/"><img src="https://img.shields.io/badge/Design-Figma-purple?logo=figma&style=for-the-badge" /></a>
  <a href="https://www.clerk.com/"><img src="https://img.shields.io/badge/Auth-Clerk-orange?style=for-the-badge" /></a>
  <a href="https://cloudinary.com/"><img src="https://img.shields.io/badge/Storage-Cloudinary-blue?style=for-the-badge" /></a>
  <a href="#"><img src="https://img.shields.io/badge/AI-Gemini%202.0%20Flash-red?style=for-the-badge" /></a>
</p>

---






## 🚀 Quick Overview

**QuickAI Hub** is a **next-generation SaaS platform** combining **AI content creation, educational tools, and productivity features** in one unified dashboard.  

Transform your workflow with AI-powered **images, videos, blogs, presentations, quizzes, and intelligent study tools** — all with a beautiful user interface and integrated community features.

<p align="center">
  <img src="client/src/assets/ai_gen_img_3.png" alt="QuickAI Demo" width="80%">
</p>

---

## 🎨 Key Features


### 🖌️ Content Creation Hub

| Feature | Description | Status |
|---------|-------------|--------|
| **🖼️ AI Image Generator** | Generate high-quality images with ClipDrop API featuring multiple styles: Realistic, Cyberpunk, Fantasy, Ghibli, Anime, Cartoon, 3D, Portrait, Cinematic, Futuristic, Surreal, Minimalist, Pop Art | ✅ Premium |
| **🎬 AI Video Generator** | Create animated videos from images with Cloudinary transformations and effects | ✅ Premium |
| **📝 Blog Title Generator** | Generate catchy, SEO-optimized titles powered by Gemini 2.0 Flash | ✅ Free/Premium |
| **📄 Article & Blog Writer** | Auto-generate full-length, well-structured articles with customizable length | ✅ Free/Premium |
| **📊 Presentation Maker** | Generate complete PowerPoint presentations with AI-designed slides using PptxGenJS | ✅ Premium |
| **🖌️ Background Remover** | Remove image backgrounds instantly with Cloudinary AI | ✅ Premium |
| **✂️ Object Remover** | Remove unwanted objects from images using gen_remove effect | ✅ Premium |
| **📋 Resume Review** | Get AI-powered feedback on your resume (PDF, DOC, DOCX) | ✅ Premium |

---


### 🧠 Advanced Study Assistant

| Feature | Description | Details |
|---------|-------------|---------|
| **📚 Multi-Source Content Loading** | Load content from YouTube videos (with transcripts), web pages, PDFs, TXT, DOC, and DOCX files | Max 10MB files |
| **🤖 Intelligent AI Chat** | Ask questions with Claude/ChatGPT-level responses (10,000 token limit) featuring comprehensive explanations, code walkthroughs, and multi-line input support (Shift+Enter) | Premium only |
| **🎯 Smart Content Chunking** | Automatically processes large documents (up to 20,000+ characters) with intelligent chunking for complete coverage | Handles 100KB+ files |
| **🔍 Page-Specific Queries** | Detects and retrieves specific pages, experiments, sessions, or lab exercises from large documents | Advanced search |
| **🧩 Quiz Generator** | Auto-generate high-quality multiple-choice quizzes with mixed difficulty levels from any loaded content | 5 questions/quiz |
| **💡 Context-Aware Responses** | Multi-factor relevance scoring finds the most relevant content sections for your questions | 4-chunk comprehensive mode |

---


### 🏠 User Dashboard & Community

| Feature | Description |
|---------|-------------|
| **📊 Personal Dashboard** | Manage all your AI creations, view history, track usage, and organize content |
| **🌐 Community Gallery** | Explore and share AI-generated images and videos with the community |
| **📈 Usage Tracking** | Monitor your free tier usage (10 requests) and premium features |
| **🔒 Secure Authentication** | Clerk-powered authentication with user metadata management |

---



## 💻 Tech Stack

### Frontend
- **Framework:** React.js 18 with Vite
- **Styling:** Tailwind CSS with custom design system
- **UI Components:** Lucide-React icons, custom components
- **State Management:** React Hooks (useState, useEffect)
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast
- **Authentication:** Clerk React SDK

### Backend
- **Runtime:** Node.js with Express.js
- **Database:** PostgreSQL (Neon DB) with @neondatabase/serverless
- **Authentication:** Clerk Express SDK with custom middleware
- **AI Integration:** 
  - Gemini 2.0 Flash (via OpenAI SDK compatibility layer)
  - 10,000 token responses for Study Assistant
  - 4,000 tokens for quiz generation
- **File Processing:**
  - pdf-parse for PDF extraction
  - mammoth for DOC/DOCX processing
  - youtubei.js for YouTube transcripts
  - axios for web scraping
- **Image/Video Processing:**
  - Cloudinary v2 SDK
  - ClipDrop API for image generation
- **File Storage:** Multer for temporary uploads
- **Presentation Generation:** PptxGenJS

### Development Tools
- **Version Control:** Git & GitHub
- **API Testing:** Postman
- **IDE:** VS Code
- **Package Manager:** npm

---



## 📁 Project Structure
```bash
QuickAI/
│
├── server/                     # Backend (Node.js + Express)
│   ├── configs/
│   │   ├── db.js              # Neon PostgreSQL connection
│   │   ├── cloudinary.js      # Cloudinary config
│   │   └── multer.js          # File upload middleware
│   ├── controllers/
│   │   └── aiController.js    # All AI feature logic
│   │   └── userController.js  # User Creations handling
│   ├── middlewares/
│   │   └── auth.js            # Clerk authentication middleware
│   ├── routes/
│   │   ├── aiRoutes.js        # AI endpoint routes
│   │   └── userRoutes.js      # User management routes
│   ├── temp/                  # Temporary file storage
│   ├── .env                   # Environment variables
│   ├── package.json           # Backend dependencies
│   └── server.js              # Express server entry point
│   └── vercel.json
│
├── client/                        # Frontend (React + Vite)
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── assets/                   # Images and media
│   │   ├── components/               # Reusable UI components
│   │   ├── pages/                    # Application pages
│   │   │   ├── Home.jsx              # Landing page
│   │   │   ├── Layout.jsx            # Dashboard layout
│   │   │   ├── Dashboard.jsx         # Main dashboard
│   │   │   ├── WriteArticle.jsx
│   │   │   ├── BlogTitles.jsx
│   │   │   ├── GenerateImages.jsx
│   │   │   ├── GenerateVideo.jsx
│   │   │   ├── RemoveBackground.jsx
│   │   │   ├── RemoveObject.jsx
│   │   │   ├── ReviewResume.jsx
│   │   │   ├── PresentationMaker.jsx
│   │   │   ├── StudyAssistant.jsx      # Advanced study tool
│   │   │   └── Community.jsx
│   │   ├── App.jsx                     # Root component with routing
│   │   ├── main.jsx                    # Vite entry point
│   │   └── index.css                   # Global styles
│   ├── .env                            # Frontend environment variables
│   ├── package.json                    # Frontend dependencies
│   ├── vite.config.js                  # Vite configuration
│   └── tailwind.config.js              # Tailwind CSS config
│   └── vercel.json
│
├── .gitignore
└── README.md
```


---

## ⚙️ Environment Variables

*Backend (.env in /server)*
```env
# Server Configuration
PORT=5000


#Database (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@host/database?sslmode=require


#Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx


#Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret


#AI Services
GEMINI_API_KEY=your_gemini_api_key


#ClipDrop (Image Generation)
CLIPDROP_API_KEY=your_clipdrop_api_key
```

*Frontend (.env in /client)*
```env
# API Base URL
VITE_BASE_URL=http://localhost:5000


#Clerk Frontend
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

---

## 🛠️ Installation & Setup
### Prerequisites

- *Node.js 18+ and npm*
- *PostgreSQL database (Neon DB recommended)*
- *Clerk account for authentication*
- *Cloudinary account for media storage*
- *Gemini API key*
- *ClipDrop API key (optional, for premium features)*



### Step-by-Step Installation

```bash
#Clone the repository
git clone https://github.com/nayan777pratyush/QuickAI.git

cd QuickAI

#Install backend dependencies
cd server
npm install

#Create backend .env file

#Copy the environment variables template above and fill in your credentials

#Set up database
#Run SQL schema (create tables for users, creations, etc.)

#Install frontend dependencies
cd ../client
npm install

#Create frontend .env file
#Add VITE_BASE_URL and VITE_CLERK_PUBLISHABLE_KEY

#Start the backend server (from /server directory)
npm run server
#Backend runs on http://localhost:5000

#Start the frontend (from /client directory, in new terminal)
npm run dev
# Frontend runs on http://localhost:5173
```

---

### 🚀 Usage

- *Sign Up/Login using Clerk authentication*
- *Choose a Feature from the dashboard*
- **Free Tier:** 10 requests for article generation and blog titles
- **Premium Features:** Upgrade for unlimited access to all tools
- **Study Assistant:**
  - Load content from YouTube, web, or upload files (PDF/DOC/DOCX up to 10MB)
  - Ask questions with Shift+Enter for multi-line input
  - Generate quizzes automatically
  - Get comprehensive, Claude-level responses up to 10,000 tokens
- **Community:** Share your AI creations and explore others' work


---

### 📊 Database Schema
```sql
-- Users table (managed by Clerk, referenced by user_id)

-- Creations table
CREATE TABLE creations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'article', 'blog-title', 'image', 'video', 'ppt', 'study-qa', 'study-quiz', etc.
  publish BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```


---

## 🎯 Key Features Explained

### Study Assistant Deep Dive
- **Content Processing:**
  - Handles files up to 10MB (PDF, TXT, DOC, DOCX)
  - Extracts YouTube video transcripts via youtubei.js
  - Scrapes and cleans web page content
  - Automatically chunks large documents (18,000 chars per chunk)

- **Intelligent Query System:**
  - Detects page-specific queries (e.g., "explain page 13")
  - Uses comprehensive mode (4 chunks) for specific sections
  - Uses keyword mode (3 chunks) for general questions
  - Multi-factor relevance scoring for optimal content retrieval

- **Response Quality:**
  - 10,000 token limit for detailed explanations
  - Line-by-line code walkthroughs
  - Multi-section synthesis
  - Educational framework with 10 core principles
  - Natural language formatting (no markdown in output)

---

## 🤝 Contributing

### Contributions are welcome! Here's how:
```bash
#Fork the repository
#Create a feature branch
git checkout -b feature/amazing-feature


#Commit your changes
git commit -m "Add amazing feature"


#Push to the branch
git push origin feature/amazing-feature

#Open a Pull Request
```

---

## Contribution Guidelines

- Follow existing code style and structure
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 📞 Contact & Support

- GitHub: [@nayan777pratyush](https://github.com/nayan777pratyush)
- Email: pratyushbhattacharya1020@gmail.com
- LinkedIn: https://www.linkedin.com/in/pratyush-bhattacharya

---

## 🙏 Acknowledgments

- Gemini AI for powerful language model capabilities
- Clerk for seamless authentication
- Cloudinary for media processing and storage
- Neon for serverless PostgreSQL
- ClipDrop for AI image generation
- React and Vite communities for excellent frameworks

---

## 🔮 Future Roadmap

 - Voice input for Study Assistant
 - Mobile app (React Native)
 - Collaborative features (team workspaces)
 - Advanced analytics dashboard
 - Integration with more AI models (GPT-4, Claude)
 - Export study notes as PDF
 - Flashcard generation mode
 - Real-time collaboration on documents
 - API access for developers


---
<p align="center">
  Made with ❤️ by Pratyush
</p>
<p align="center">
  ⭐ Star this repo if you find it helpful!
</p>

<p align="center">
  <a href="#-quick-overview">Back to Top</a>
</p>
