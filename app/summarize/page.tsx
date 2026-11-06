"use client";
import { useState } from "react";

export default function SummarizePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<{
    website_name: string;
    html_content: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSummarize = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        body: new FormData(e.currentTarget),
      });
      const data = await response.json();
      if (response.ok) {
        setSummary(data.masterSummary);
        setSuccess(data.message);
      } else {
        setError(
          typeof data === "string"
            ? data
            : (data.message ??
                "An error occurred while summarizing the webpage."),
        );
      }
    } catch (e) {
      setError("Internal server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background px-6 py-12 text-[#17212b] sm:px-10 lg:px-16">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-12 flex items-center justify-between border-b border-[#dbe3ee] pb-4">
          <p className="text-xs font-semibold tracking-[0.12em] text-blue-700">
            BRIEFY <span className="px-2 text-orange-500">/</span> SUMMARIZER
          </p>
          <p className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-green-500"
            />
            READY
          </p>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-medium text-orange-700">
              Start with a link
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Summarize a webpage
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-gray-600">
              Add a webpage URL to get a clear overview of its main ideas.
            </p>

            <form
              action="/summarize"
              method="get"
              className="mt-9"
              onSubmit={handleSummarize}
            >
              <label
                htmlFor="webpage-url"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Webpage URL
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="webpage-url"
                  name="url"
                  type="url"
                  required
                  placeholder="https://example.com/article"
                  className="min-h-12 min-w-0 flex-1 border border-gray-300 bg-white px-4 text-base text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="submit"
                  className="min-h-12 bg-[#2563eb] px-5 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
                >
                  {isLoading ? "Summarizing..." : "Summarize"}
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Enter a full URL, including https://
              </p>
              {error ? (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              ) : (
                success !== null && (
                  <p className="mt-2 text-sm text-green-600">{success}</p>
                )
              )}
            </form>
          </div>

          <aside
            aria-label="Summary output preview"
            className="min-h-72 border border-[#dbe3ee] bg-white p-6 sm:p-8"
          >
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <p className="text-xs font-semibold tracking-[0.1em] text-blue-700">
                SUMMARY OUTPUT
              </p>
              <span className="text-xs text-gray-400">WAITING FOR URL</span>
            </div>
            {summary ? (
              <div dangerouslySetInnerHTML={{ __html: summary.html_content }} />
            ) : (
              <div className="flex min-h-48 flex-col justify-center">
                <p className="text-lg font-semibold text-gray-800">
                  Your summary will appear here
                </p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  Add a webpage URL to get started.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
