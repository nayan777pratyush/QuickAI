import React, { useState } from "react";
import { Edit, DownloadCloud, FileText, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const PresentationMaker = () => {
  const { getToken } = useAuth();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [pptUrl, setPptUrl] = useState("");
  const [pptFileName, setPptFileName] = useState("");
  const [slideCount, setSlideCount] = useState(0);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a presentation topic");
      return;
    }

    try {
      setLoading(true);
      setPptUrl("");
      setPptFileName("");
      setSlideCount(0);

      const token = await getToken();

      const { data } = await axios.post(
        "/api/ai/generate-pptx",
        { prompt },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        setPptUrl(data.content);
        setPptFileName(data.fileName || "presentation.pptx");
        setSlideCount(data.slideCount || 0);
        toast.success(data.message || "PPT generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate PPT");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.response?.data?.message || err.message || "Error generating PPT");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Direct download link - Cloudinary URLs are direct download links
    const link = document.createElement('a');
    link.href = pptUrl;
    link.download = pptFileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI Presentation Generator
          </h1>
          <p className="text-gray-600">
            Create professional presentations in seconds with AI
          </p>
        </div>

        {/* Main Form */}
        <form
          onSubmit={onSubmitHandler}
          className="bg-white rounded-2xl shadow-lg p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Edit className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Create Presentation
            </h2>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Presentation Topic
            </label>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              type="text"
              className="w-full p-4 text-base rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="E.g., The Future of Artificial Intelligence, Marketing Strategies 2025, Climate Change Solutions..."
              required
              disabled={loading}
            />
            <p className="mt-2 text-xs text-gray-500">
              Be specific for better results. AI will generate 5-7 slides based on your topic.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Presentation...
              </>
            ) : (
              <>
                <Edit className="w-5 h-5" />
                Generate Presentation
              </>
            )}
          </button>
        </form>

        {/* Result Section */}
        {pptUrl && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Presentation Ready!
              </h2>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    File Name
                  </p>
                  <p className="text-lg font-semibold text-gray-800 mb-3">
                    {pptFileName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {slideCount} slides generated • PowerPoint format (.pptx)
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <DownloadCloud className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <DownloadCloud className="w-5 h-5" />
                Download PPT
              </button>
              
              <a
                href={pptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <FileText className="w-5 h-5" />
                Open in Browser
              </a>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> You can edit the downloaded presentation in PowerPoint, Google Slides, or any compatible software.
              </p>
            </div>
          </div>
        )}

        {/* Info Section */}
        {!pptUrl && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              How it works
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                  1
                </div>
                <p className="text-gray-600">
                  Enter your presentation topic or description
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                  2
                </div>
                <p className="text-gray-600">
                  AI generates a structured outline with 5-7 slides
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                  3
                </div>
                <p className="text-gray-600">
                  Download your professional PowerPoint presentation
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresentationMaker;