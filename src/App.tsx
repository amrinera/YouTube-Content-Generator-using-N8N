import React, { useState, useEffect } from 'react';
import { Play, Loader2, AlertCircle, Copy, CheckCircle, Youtube } from 'lucide-react';

interface GeneratedContent {
  description: string;
  titles: string[];
}

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [outputLang, setOutputLang] = useState('English');
  const [toneOfVoice, setToneOfVoice] = useState('Conversational');
  const [audienceFocus, setAudienceFocus] = useState('Beginners');
  const [descriptionLength, setDescriptionLength] = useState('Standard');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [showThumbnail, setShowThumbnail] = useState(false);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  useEffect(() => {
    if (!url.trim()) {
      setThumbnailUrl('');
      setShowThumbnail(false);
      return;
    }

    const videoId = extractVideoId(url);
    if (videoId && isValidYouTubeUrl(url)) {
      const newThumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      setThumbnailUrl(newThumbnailUrl);
      setShowThumbnail(true);
    } else {
      setThumbnailUrl('');
      setShowThumbnail(false);
    }
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setContent(null);

    try {
      const response = await fetch('#yourwebhook goes here', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          video_url: url.trim(),
          output_language: outputLang,
          tone_of_voice: toneOfVoice,
          audience_focus: audienceFocus,
          description_length: descriptionLength
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      // ✅ SAFELY parse JSON with fallback
      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        throw new Error('Invalid JSON response');
      }

      if (!data.description || !data.titles) {
        throw new Error('Missing data from server');
      }

      // Validate titles are strings and filter valid ones
      const validTitles = Array.isArray(data.titles) 
        ? data.titles.filter(title => typeof title === 'string' && title.trim())
        : [];

      if (validTitles.length === 0) {
        throw new Error('No valid titles found in response');
      }

      setContent({
        description: data.description.trim(),
        titles: validTitles.slice(0, 10) // Ensure max 10 titles
      });

    } catch (err) {
      console.error('Error generating content:', err);
      setError(err.message || 'Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const toneOptions = [
    { value: 'Conversational', label: '🎙️ Conversational', description: 'Natural and engaging' },
    { value: 'Informative', label: '📚 Informative', description: 'Educational and detailed' },
    { value: 'Casual', label: '😎 Funny / Casual', description: 'Light and entertaining' },
    { value: 'Inspirational', label: '✨ Inspirational', description: 'Motivating and uplifting' }
  ];

  const audienceOptions = [
    { value: 'Beginners', label: '🧑‍💻 Beginners', description: 'New to the topic' },
    { value: 'Advanced users', label: '🏆 Advanced users', description: 'Experienced and technical' },
    { value: 'Students', label: '🏫 Students', description: 'Learning and academic focus' },
    { value: 'Professionals', label: '👩‍💼 Professionals', description: 'Business and career oriented' }
  ];

  const lengthOptions = [
    { value: 'Short', label: '📏 Short', description: 'Concise and to the point' },
    { value: 'Standard', label: '📄 Standard', description: 'Balanced length for most videos' },
    { value: 'Long', label: '📚 Long', description: 'Detailed and comprehensive' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-[#4f772d] p-4 rounded-full shadow-lg animate-pulse-slow">
              <Youtube className="w-10 h-10 text-white animate-bounce-gentle" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            YouTube Content Generator
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Generate SEO-optimized descriptions and engaging titles for your YouTube videos using AI-powered content analysis
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 mb-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Video Thumbnail Preview - Now at the top and wider */}
            {showThumbnail && thumbnailUrl && (
              <div className="animate-fade-in">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-3">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    </div>
                    Video Preview
                  </h3>
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.01] max-w-4xl mx-auto">
                    <img
                      src={thumbnailUrl}
                      alt="YouTube video thumbnail"
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        setShowThumbnail(false);
                      }}
                      onLoad={(e) => {
                        // Ensure the thumbnail loaded successfully
                        if (e.currentTarget.naturalWidth === 0) {
                          setShowThumbnail(false);
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="w-20 h-20 bg-red-600 bg-opacity-90 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 transform scale-75 hover:scale-100">
                        <Play className="w-10 h-10 text-white ml-1" />
                      </div>
                    </div>
                    {/* Gradient overlay for better text readability */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent h-20 pointer-events-none"></div>
                  </div>
                </div>
              </div>
            )}

            {/* YouTube URL Section */}
            <div className="pb-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <Youtube className="w-5 h-5 text-white" />
                </div>
                Video URL
              </h2>
              <input
                id="youtube-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=example or https://youtu.be/example"
                className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-2 focus:ring-[#4f772d] focus:border-transparent transition-all duration-200 text-lg ${
                  url && !isValidYouTubeUrl(url) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
                required
              />
              {url && !isValidYouTubeUrl(url) && (
                <p className="text-red-600 text-sm mt-2 ml-2">Please enter a valid YouTube URL</p>
              )}
            </div>

            {/* Content Preferences Section */}
            <div className="space-y-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#4f772d] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⚙️</span>
                </div>
                Content Preferences
              </h2>

              {/* Language Selection */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  🌍 Output Language
                </h3>
                <div className="flex flex-wrap gap-4">
                  {['English', 'French', 'Spanish', 'Hindi'].map((language) => (
                    <label key={language} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="outputLang"
                        value={language}
                        checked={outputLang === language}
                        onChange={(e) => setOutputLang(e.target.value)}
                        className="sr-only"
                        disabled={loading}
                      />
                      <div className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all duration-200 ${
                        outputLang === language
                          ? 'border-[#4f772d] bg-[#4f772d] text-white shadow-lg'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-[#4f772d] hover:bg-green-50'
                      }`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          outputLang === language
                            ? 'border-white'
                            : 'border-gray-400 group-hover:border-[#4f772d]'
                        }`}>
                          {outputLang === language && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="font-semibold">{language}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tone of Voice Selection */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  🎭 Tone of Voice
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {toneOptions.map((tone) => (
                    <label key={tone.value} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="toneOfVoice"
                        value={tone.value}
                        checked={toneOfVoice === tone.value}
                        onChange={(e) => setToneOfVoice(e.target.value)}
                        className="sr-only"
                        disabled={loading}
                      />
                      <div className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-200 w-full ${
                        toneOfVoice === tone.value
                          ? 'border-[#4f772d] bg-[#4f772d] text-white shadow-lg'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-[#4f772d] hover:bg-green-50'
                      }`}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          toneOfVoice === tone.value
                            ? 'border-white'
                            : 'border-gray-400 group-hover:border-[#4f772d]'
                        }`}>
                          {toneOfVoice === tone.value && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg mb-1">{tone.label}</div>
                          <div className={`text-sm ${
                            toneOfVoice === tone.value ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {tone.description}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Audience Focus Selection */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  👥 Audience Focus
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {audienceOptions.map((audience) => (
                    <label key={audience.value} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="audienceFocus"
                        value={audience.value}
                        checked={audienceFocus === audience.value}
                        onChange={(e) => setAudienceFocus(e.target.value)}
                        className="sr-only"
                        disabled={loading}
                      />
                      <div className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-200 w-full ${
                        audienceFocus === audience.value
                          ? 'border-[#4f772d] bg-[#4f772d] text-white shadow-lg'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-[#4f772d] hover:bg-green-50'
                      }`}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          audienceFocus === audience.value
                            ? 'border-white'
                            : 'border-gray-400 group-hover:border-[#4f772d]'
                        }`}>
                          {audienceFocus === audience.value && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg mb-1">{audience.label}</div>
                          <div className={`text-sm ${
                            audienceFocus === audience.value ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {audience.description}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description Length Selection */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  📏 Description Length
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {lengthOptions.map((length) => (
                    <label key={length.value} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="descriptionLength"
                        value={length.value}
                        checked={descriptionLength === length.value}
                        onChange={(e) => setDescriptionLength(e.target.value)}
                        className="sr-only"
                        disabled={loading}
                      />
                      <div className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-200 w-full ${
                        descriptionLength === length.value
                          ? 'border-[#4f772d] bg-[#4f772d] text-white shadow-lg'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-[#4f772d] hover:bg-green-50'
                      }`}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          descriptionLength === length.value
                            ? 'border-white'
                            : 'border-gray-400 group-hover:border-[#4f772d]'
                        }`}>
                          {descriptionLength === length.value && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg mb-1">{length.label}</div>
                          <div className={`text-sm ${
                            descriptionLength === length.value ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {length.description}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !url.trim() || (url && !isValidYouTubeUrl(url))}
              className="w-full py-5 px-8 text-xl font-bold bg-[#4f772d] text-white rounded-xl hover:bg-[#3d5a23] disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating... Please wait...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Play className="w-6 h-6" />
                  Generate Content
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">❌ Error</h3>
                <p className="text-red-700 leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Generated Content */}
        {content && (
          <div className="space-y-8 animate-fade-in">
            {/* Description Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">SEO Description</h2>
                <button
                  onClick={() => copyToClipboard(content.description, 'description')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  {copied === 'description' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={content.description}
                readOnly
                rows={6}
                className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 resize-none focus:outline-none leading-relaxed"
              />
              <p className="text-sm text-gray-500 mt-2">
                {content.description.length} characters
              </p>
            </div>

            {/* Titles Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Suggested Titles</h2>
              <div className="space-y-3">
                {content.titles.map((title, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <span className="flex-shrink-0 w-7 h-7 bg-[#4f772d] text-white text-sm font-bold rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <p className="text-gray-800 font-medium leading-relaxed">{title}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(title, `title-${index}`)}
                      className="opacity-0 group-hover:opacity-100 ml-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-all duration-200"
                    >
                      {copied === `title-${index}` ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="mb-4">Enter your YouTube video URL above to generate optimized content</p>
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} . All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;