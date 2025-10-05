import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { BookOpen, FileText, Globe, Youtube, Sparkles, Brain, Send, Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const StudyAssistant = () => {
  const { getToken } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [file, setFile] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loadedContent, setLoadedContent] = useState("");
  const [loadedSource, setLoadedSource] = useState("");
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  const handleKeyDown = (e) => {
    // Allow Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setQuery(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  const handleLoadContent = async () => {
    if (selectedSource === "youtube" && !youtubeUrl.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    if (selectedSource === "weblink" && !websiteUrl.trim()) {
      toast.error("Please enter a website URL");
      return;
    }

    if (selectedSource === "pdf" && !file) {
      toast.error("Please upload a file");
      return;
    }

    // File size validation (10MB)
    if (selectedSource === "pdf" && file && file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("sourceType", selectedSource);
      
      if (selectedSource === "youtube") formData.append("youtubeUrl", youtubeUrl);
      if (selectedSource === "weblink") formData.append("websiteUrl", websiteUrl);
      if (selectedSource === "pdf" && file) formData.append("file", file);

      const { data } = await axios.post(
        "/api/ai/load-study-material",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        setLoadedSource(data.source);
        setIsContentLoaded(true);
        
        let successMessage = `Content loaded successfully! (${data.contentLength} characters)`;
        if (data.chunkCount > 1) {
          successMessage += ` Split into ${data.chunkCount} parts for optimal processing.`;
        }
        
        toast.success(successMessage);
        
        setChatHistory(prev => [...prev, { 
          role: "system", 
          content: `✓ Content loaded from: ${data.source}\n📊 Size: ${data.contentLength} characters${data.chunkCount > 1 ? ` (${data.chunkCount} parts)` : ''}\nYou can now ask questions or generate a quiz!` 
        }]);
      } else {
        toast.error(data.message || "Failed to load content");
      }
    } catch (error) {
      console.error("Load content error:", error);
      toast.error(error.response?.data?.message || "Error loading content");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedSource === "quiz") {
      await handleGenerateQuiz();
    } else {
      await handleAskQuestion();
    }
  };

  const handleAskQuestion = async () => {
    if (!query.trim()) {
      toast.error("Please enter a question");
      return;
    }

    if (!isContentLoaded) {
      toast.error("Please load study content first");
      return;
    }

    setLoading(true);
    setChatHistory(prev => [...prev, { role: "user", content: query }]);
    const currentQuery = query;
    setQuery("");

    try {
      const token = await getToken();

      const { data } = await axios.post(
        "/api/ai/study-assistant-chat",
        {
          query: currentQuery,
          mode: "default"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        setChatHistory(prev => [...prev, { 
          role: "assistant", 
          content: data.response 
        }]);
      } else {
        toast.error(data.message || "Failed to get response");
        setChatHistory(prev => [...prev, { 
          role: "assistant", 
          content: "Sorry, I couldn't process that question. Please try again." 
        }]);
      }
    } catch (error) {
      console.error("Ask question error:", error);
      toast.error(error.response?.data?.message || "Error getting response");
      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, there was an error processing your question." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!isContentLoaded) {
      toast.error("Please load study content first");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();

      const { data } = await axios.post(
        "/api/ai/study-assistant-chat",
        {
          mode: "quiz"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        try {
          const parsedQuiz = JSON.parse(data.response);
          if (Array.isArray(parsedQuiz) && parsedQuiz.length > 0) {
            setQuiz(parsedQuiz);
            setUserAnswers({});
            setShowResults(false);
            toast.success(`Generated ${parsedQuiz.length} quiz questions!`);
          } else {
            toast.error("Invalid quiz format received");
          }
        } catch (parseError) {
          console.error("Quiz parse error:", parseError);
          toast.error("Failed to parse quiz data");
        }
      } else {
        toast.error(data.message || "Failed to generate quiz");
      }
    } catch (error) {
      console.error("Generate quiz error:", error);
      toast.error(error.response?.data?.message || "Error generating quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    if (showResults) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  const checkAnswers = () => {
    const totalAnswered = Object.keys(userAnswers).length;
    if (totalAnswered < quiz.length) {
      toast.error(`Please answer all ${quiz.length} questions`);
      return;
    }

    setShowResults(true);
    const correct = quiz.filter((q, idx) => userAnswers[idx] === q.answer).length;
    const percentage = Math.round((correct / quiz.length) * 100);
    
    if (percentage >= 80) {
      toast.success(`Excellent! ${correct}/${quiz.length} correct (${percentage}%)`);
    } else if (percentage >= 60) {
      toast.success(`Good job! ${correct}/${quiz.length} correct (${percentage}%)`);
    } else {
      toast(`${correct}/${quiz.length} correct (${percentage}%). Keep studying!`, {
        icon: '📚',
      });
    }
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setShowResults(false);
    setQuiz([]);
  };

  const resetSource = () => {
    setLoadedContent("");
    setLoadedSource("");
    setIsContentLoaded(false);
    setChatHistory([]);
    setYoutubeUrl("");
    setWebsiteUrl("");
    setFile(null);
    setQuiz([]);
    setUserAnswers({});
    setShowResults(false);
  };

  const formatResponse = (text) => {
    if (!text) return "";
    
    let formatted = text
      .replace(/\*\*\*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/^#+\s+/gm, '')
      .replace(/`([^`]+)`/g, '$1')
      .trim();
    
    return formatted;
  };

  return (
    <div className="h-full overflow-y-scroll p-4 sm:p-6 flex flex-col lg:flex-row items-start gap-4 text-slate-700">
      {/* LEFT SIDE - Chat/Q&A */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden h-[600px] lg:h-[calc(100vh-120px)]">
        <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2 sm:gap-3">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8" />
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">AI Study Chat</h2>
                <p className="text-indigo-100 text-xs sm:text-sm hidden sm:block">Ask questions, get explanations, summarize content</p>
              </div>
            </div>
            {isContentLoaded && (
              <button
                onClick={resetSource}
                className="px-2 sm:px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs sm:text-sm transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center px-4">
              <div className="max-w-md">
                <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Start Your Study Session</h3>
                <p className="text-sm text-gray-500">Select a source below, load content, then ask questions</p>
              </div>
            </div>
          ) : (
            chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : msg.role === "system" ? "justify-center" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl text-sm sm:text-base ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : msg.role === "system"
                      ? "bg-blue-100 text-blue-800 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full"
                      : "bg-gray-100 text-gray-800 rounded-bl-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed" style={{ wordBreak: 'break-word' }}>
                    {formatResponse(msg.content)}
                  </p>
                </div>
              </div>
            ))
          )}
          {loading && selectedSource !== "quiz" && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-none">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t bg-gray-50">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                value={query}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedSource === "quiz" 
                    ? "Generate quiz..." 
                    : isContentLoaded 
                      ? "Ask a question..." 
                      : "Load content first..."
                }
                className="w-full p-2 sm:p-3 text-sm border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none disabled:bg-gray-100 resize-none overflow-y-auto"
                style={{ 
                  minHeight: '44px',
                  maxHeight: '150px',
                }}
                rows={1}
                disabled={loading || (selectedSource === "quiz" && quiz.length > 0) || (!isContentLoaded && selectedSource !== "quiz")}
              />
              {query.trim() && (
                <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 bg-gray-50 px-1">
                  Shift+Enter for new line
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || (selectedSource === "quiz" && quiz.length > 0) || (!isContentLoaded && selectedSource !== "quiz")}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-[44px]"
            >
              {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE - Source Selection & Content */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-3 sm:p-4 bg-white border-b">
          <div className="grid grid-cols-4 gap-1 sm:gap-2">
            <button
              onClick={() => setSelectedSource("youtube")}
              className={`p-2 sm:p-3 rounded-lg font-semibold transition-all flex flex-col items-center gap-1 sm:gap-2 ${
                selectedSource === "youtube"
                  ? "bg-red-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Youtube className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs">YouTube</span>
            </button>

            <button
              onClick={() => setSelectedSource("pdf")}
              className={`p-2 sm:p-3 rounded-lg font-semibold transition-all flex flex-col items-center gap-1 sm:gap-2 ${
                selectedSource === "pdf"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FileText className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs">Docs</span>
            </button>

            <button
              onClick={() => setSelectedSource("weblink")}
              className={`p-2 sm:p-3 rounded-lg font-semibold transition-all flex flex-col items-center gap-1 sm:gap-2 ${
                selectedSource === "weblink"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Globe className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs">Web Link</span>
            </button>

            <button
              onClick={() => setSelectedSource("quiz")}
              className={`p-2 sm:p-3 rounded-lg font-semibold transition-all flex flex-col items-center gap-1 sm:gap-2 ${
                selectedSource === "quiz"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs">Quiz</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-h-[500px] lg:max-h-[calc(100vh-220px)]">
          {selectedSource === "youtube" && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                <h3 className="text-base sm:text-lg font-bold">YouTube Video</h3>
              </div>
              
              <div className="mb-3 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                <p className="font-semibold mb-1">⚠️ Important:</p>
                <p>Video must have captions/subtitles enabled.</p>
              </div>

              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full p-2 sm:p-3 text-sm border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none mb-4"
                disabled={loading}
              />
              {isContentLoaded && loadedSource.includes("YouTube") && (
                <div className="mb-3 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg text-xs sm:text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 break-words">Loaded: {loadedSource}</span>
                </div>
              )}
              <button
                onClick={handleLoadContent}
                disabled={loading || !youtubeUrl.trim()}
                className="w-full bg-red-600 text-white py-2 sm:py-3 text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Upload className="w-4 h-4 sm:w-5 sm:h-5" />}
                {loading ? "Loading..." : "Load Video Content"}
              </button>
            </div>
          )}

          {selectedSource === "pdf" && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <h3 className="text-base sm:text-lg font-bold">Upload Document</h3>
              </div>
              <div className="mb-3 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                <p className="font-semibold mb-1">📄 Supported formats:</p>
                <p>PDF, TXT, DOC, DOCX (Max 10MB)</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center mb-4 hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                  disabled={loading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm sm:text-base text-gray-600 font-semibold">
                    {file ? file.name : "Click to upload"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">PDF, TXT, DOC, or DOCX • Max 10MB</p>
                </label>
              </div>
              {isContentLoaded && file && (
                <div className="mb-3 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg text-xs sm:text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 break-words">Loaded: {loadedSource}</span>
                </div>
              )}
              <button
                onClick={handleLoadContent}
                disabled={loading || !file}
                className="w-full bg-blue-600 text-white py-2 sm:py-3 text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Upload className="w-4 h-4 sm:w-5 sm:h-5" />}
                {loading ? "Processing..." : "Upload & Process"}
              </button>
            </div>
          )}

          {selectedSource === "weblink" && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                <h3 className="text-base sm:text-lg font-bold">Website URL</h3>
              </div>
              <input
                type="url"
                placeholder="https://example.com/article"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full p-2 sm:p-3 text-sm border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none mb-4"
                disabled={loading}
              />
              {isContentLoaded && loadedSource.includes("http") && (
                <div className="mb-3 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg text-xs sm:text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 break-words">Loaded: {loadedSource}</span>
                </div>
              )}
              <button
                onClick={handleLoadContent}
                disabled={loading || !websiteUrl.trim()}
                className="w-full bg-green-600 text-white py-2 sm:py-3 text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Upload className="w-4 h-4 sm:w-5 sm:h-5" />}
                {loading ? "Fetching..." : "Load Web Content"}
              </button>
            </div>
          )}

          {selectedSource === "quiz" && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100">
              {quiz.length === 0 ? (
                <>
                  <div className="flex items-center gap-2 sm:gap-3 mb-4">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    <h3 className="text-base sm:text-lg font-bold">Generate Quiz</h3>
                  </div>
                  
                  {!isContentLoaded ? (
                    <div className="text-center py-6 sm:py-8">
                      <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-purple-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">Load content first to generate a quiz</p>
                      <p className="text-xs text-gray-500">Select YouTube, PDF, or Web Link tab and load your study material</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 p-2 sm:p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs sm:text-sm text-purple-700">
                        <p className="font-semibold mb-1 break-words">Content loaded: {loadedSource}</p>
                        <p className="text-xs">Click below to generate quiz questions</p>
                      </div>
                      <button
                        onClick={handleGenerateQuiz}
                        disabled={loading}
                        className="w-full bg-purple-600 text-white py-2 sm:py-3 text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />}
                        {loading ? "Generating..." : "Generate Quiz"}
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-base sm:text-lg font-bold">Quiz Questions</h3>
                    <div className="flex gap-2">
                      {!showResults && (
                        <button
                          onClick={checkAnswers}
                          disabled={Object.keys(userAnswers).length < quiz.length}
                          className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold"
                        >
                          Submit
                        </button>
                      )}
                      <button
                        onClick={resetQuiz}
                        className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm font-semibold"
                      >
                        New Quiz
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {quiz.map((q, idx) => {
                      const isCorrect = userAnswers[idx] === q.answer;
                      const isAnswered = userAnswers[idx] !== undefined;
                      
                      return (
                        <div
                          key={idx}
                          className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                            showResults
                              ? isCorrect
                                ? "border-green-500 bg-green-50"
                                : "border-red-500 bg-red-50"
                              : isAnswered
                              ? "border-purple-300 bg-purple-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-2 mb-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
                              {idx + 1}
                            </span>
                            <p className="font-semibold text-gray-800 flex-1 text-sm">{q.question}</p>
                            {showResults && (
                              isCorrect ? (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                              )
                            )}
                          </div>
                          <div className="space-y-2 ml-0 sm:ml-8">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = userAnswers[idx] === opt;
                              const isCorrectAnswer = q.answer === opt;
                              
                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleAnswerSelect(idx, opt)}
                                  disabled={showResults}
                                  className={`w-full text-left p-2 sm:p-3 rounded-lg border-2 transition-all text-xs sm:text-sm ${
                                    showResults
                                      ? isCorrectAnswer
                                        ? "border-green-500 bg-green-100 font-semibold"
                                        : isSelected
                                        ? "border-red-500 bg-red-100"
                                        : "border-gray-200 bg-gray-50"
                                      : isSelected
                                      ? "border-purple-500 bg-purple-100"
                                      : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50"
                                  } ${!showResults ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                      isSelected ? 'border-purple-600' : 'border-gray-300'
                                    }`}>
                                      {isSelected && <span className="w-3 h-3 rounded-full bg-purple-600"></span>}
                                    </span>
                                    <span className="flex-1">{opt}</span>
                                    {showResults && isCorrectAnswer && (
                                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {showResults && (
                    <div className="mt-6 p-3 sm:p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border-2 border-purple-300">
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-purple-800 mb-2">
                          {quiz.filter((q, idx) => userAnswers[idx] === q.answer).length} / {quiz.length}
                        </p>
                        <p className="text-xs sm:text-sm text-purple-700">
                          {Math.round((quiz.filter((q, idx) => userAnswers[idx] === q.answer).length / quiz.length) * 100)}% Correct
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyAssistant;