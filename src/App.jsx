import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [content, setContent] = useState("");
  const [transformation, setTransformation] = useState("summarize");
  const [tone, setTone] = useState("Professional");
  const [language, setLanguage] = useState("English");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem("morphx-history");
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch {
      return [];
    }
  });

  const transformationName = {
    summarize: "Summary",
    rewrite: "Rewrite",
    translate: "Translation",
    social_media: "Social Media",
    blog: "Blog",
    email: "Email",
  };

  // Result statistics
  const wordCount = result
    ? result.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const characterCount = result ? result.length : 0;

  const readingTime = wordCount
    ? Math.max(1, Math.ceil(wordCount / 200))
    : 0;

  useEffect(() => {
    localStorage.setItem(
      "morphx-history",
      JSON.stringify(history)
    );
  }, [history]);

  const handleTransform = async () => {
    if (!content.trim()) {
      setError("Please enter some content first.");
      return;
    }

    setError("");
    setResult("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5678/webhook/transform-content",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            transformation,
            tone,
            language,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Transformation failed."
        );
      }

      const transformedContent =
        data.transformed_content;

      setResult(transformedContent);

      const newHistoryItem = {
        id: Date.now(),
        transformation,
        tone,
        language,
        originalContent: content,
        result: transformedContent,
        wordCount: transformedContent
          .trim()
          .split(/\s+/)
          .filter(Boolean).length,
        date: new Date().toLocaleString(),
      };

      setHistory((previousHistory) => [
        newHistoryItem,
        ...previousHistory,
      ]);
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to connect to MORPHX. Make sure n8n is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);
      alert("Result copied!");
    } catch {
      alert("Unable to copy the result.");
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const blob = new Blob([result], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "morphx-result.txt";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const handleHistoryClick = (item) => {
    setContent(item.originalContent);
    setTransformation(item.transformation);
    setTone(item.tone);
    setLanguage(item.language);
    setResult(item.result);
    setError("");

    document
      .getElementById("transform")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const clearHistory = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear your transformation history?"
    );

    if (confirmed) {
      setHistory([]);
      localStorage.removeItem("morphx-history");
    }
  };

  return (
    <div className="app">

      {/* NAVBAR */}

      <header className="navbar">
        <div className="logo">MORPHX</div>

        <nav>
          <a href="#home">Home</a>
          <a href="#transform">Transform</a>
          <a href="#history">History</a>
          <a href="#about">About</a>
        </nav>
      </header>

      <main>

        {/* HERO */}

        <section className="hero" id="home">
          <div className="hero-content">

            <p className="badge">
              GENAI CONTENT TRANSFORMATION
            </p>

            <h1>
              Transform your content
              <span> with AI.</span>
            </h1>

            <p className="hero-text">
              MORPHX transforms your content into clear,
              engaging and purposeful formats using
              Generative AI.
            </p>

            <a
              href="#transform"
              className="primary-button"
            >
              Start Transforming →
            </a>

          </div>
        </section>

        {/* TRANSFORM SECTION */}

        <section
          className="transform-section"
          id="transform"
        >

          <div className="section-heading">

            <p className="badge">
              MORPHX ENGINE
            </p>

            <h2>
              Transform Content
            </h2>

            <p>
              Choose how you want your content to be
              transformed.
            </p>

          </div>

          <div className="transform-card">

            <label>
              Enter your content
            </label>

            <textarea
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              placeholder="Paste or type your content here..."
              rows="10"
            />

            {/* OPTIONS */}

            <div className="options">

              <div>
                <label>
                  Transformation
                </label>

                <select
                  value={transformation}
                  onChange={(e) =>
                    setTransformation(e.target.value)
                  }
                >
                  <option value="summarize">
                    Summarize
                  </option>

                  <option value="rewrite">
                    Rewrite
                  </option>

                  <option value="translate">
                    Translate
                  </option>

                  <option value="social_media">
                    Social Media
                  </option>

                  <option value="blog">
                    Blog
                  </option>

                  <option value="email">
                    Email
                  </option>
                </select>
              </div>

              <div>
                <label>
                  Tone
                </label>

                <select
                  value={tone}
                  onChange={(e) =>
                    setTone(e.target.value)
                  }
                >
                  <option>
                    Professional
                  </option>

                  <option>
                    Friendly
                  </option>

                  <option>
                    Formal
                  </option>

                  <option>
                    Casual
                  </option>

                  <option>
                    Creative
                  </option>
                </select>
              </div>

              <div>
                <label>
                  Language
                </label>

                <select
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.target.value)
                  }
                >
                  <option>
                    English
                  </option>

                  <option>
                    Hindi
                  </option>

                  <option>
                    Telugu
                  </option>
                </select>
              </div>

            </div>

            {/* ERROR */}

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}

            {/* TRANSFORM BUTTON */}

            <button
              className="transform-button"
              onClick={handleTransform}
              disabled={loading}
            >
              {loading
                ? "✨ Transforming..."
                : "✨ Transform with AI"}
            </button>

            {/* RESULT */}

            {result && (
              <div className="result-card">

                <div className="result-header">

                  <div>

                    <p className="result-label">
                      MORPHX OUTPUT
                    </p>

                    <h3>
                      {
                        transformationName[
                          transformation
                        ]
                      }
                    </h3>

                  </div>

                  <div className="result-actions">

                    <button
                      onClick={handleCopy}
                    >
                      📋 Copy
                    </button>

                    <button
                      onClick={handleDownload}
                    >
                      📥 Download
                    </button>

                  </div>

                </div>

                {/* RESULT STATISTICS */}

                <div className="result-meta">

                  <span>
                    ✨{" "}
                    {
                      transformationName[
                        transformation
                      ]
                    }
                  </span>

                  <span>
                    🎨 {tone}
                  </span>

                  <span>
                    🌐 {language}
                  </span>

                  <span>
                    📝 {wordCount} words
                  </span>

                  <span>
                    🔤 {characterCount} characters
                  </span>

                  <span>
                    ⏱️ {readingTime} min read
                  </span>

                </div>

                {/* RESULT TEXT */}

                <div className="result-content">
                  {result}
                </div>

              </div>
            )}

          </div>

        </section>

        {/* HISTORY */}

        <section
          className="transform-section"
          id="history"
        >

          <div className="section-heading">

            <p className="badge">
              YOUR ACTIVITY
            </p>

            <h2>
              Transformation History
            </h2>

            <p>
              Revisit your previous AI transformations
              anytime.
            </p>

          </div>

          <div className="history-container">

            {history.length === 0 ? (

              <div className="empty-history">

                <div className="empty-icon">
                  📝
                </div>

                <h3>
                  No transformations yet
                </h3>

                <p>
                  Your recent MORPHX transformations
                  will appear here.
                </p>

              </div>

            ) : (

              <>

                <div className="history-top">

                  <p>
                    {history.length} transformation
                    {history.length !== 1
                      ? "s"
                      : ""}
                  </p>

                  <button
                    className="clear-history-button"
                    onClick={clearHistory}
                  >
                    Clear History
                  </button>

                </div>

                <div className="history-list">

                  {history.map((item) => (

                    <div
                      className="history-item"
                      key={item.id}
                      onClick={() =>
                        handleHistoryClick(item)
                      }
                    >

                      <div className="history-icon">
                        ✨
                      </div>

                      <div className="history-info">

                        <div className="history-title">

                          <h3>
                            {
                              transformationName[
                                item.transformation
                              ]
                            }
                          </h3>

                          <span>
                            {item.wordCount} words
                          </span>

                        </div>

                        <p className="history-preview">
                          {item.result.length > 120
                            ? `${item.result.substring(
                                0,
                                120
                              )}...`
                            : item.result}
                        </p>

                        <div className="history-meta">

                          <span>
                            🎨 {item.tone}
                          </span>

                          <span>
                            🌐 {item.language}
                          </span>

                          <span>
                            🕒 {item.date}
                          </span>

                        </div>

                      </div>

                      <div className="history-arrow">
                        →
                      </div>

                    </div>

                  ))}

                </div>

              </>

            )}

          </div>

        </section>

        {/* ABOUT */}

        <section
          className="about-section"
          id="about"
        >

          <p className="badge">
            ABOUT MORPHX
          </p>

          <h2>
            One platform.
            <br />
            Multiple transformations.
          </h2>

          <p>
            From summaries and rewrites to social posts,
            blogs and emails, MORPHX helps users transform
            content efficiently with Generative AI.
          </p>

        </section>

      </main>

      {/* FOOTER */}

      <footer>

        <p>
          © 2026 MORPHX — GenAI Content Transformation
          Platform
        </p>

      </footer>

    </div>
  );
}

export default App;