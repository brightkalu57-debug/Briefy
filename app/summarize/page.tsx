"use client";
import { useState } from "react";

export default function SummarizePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<{
    website_name: string;
    html_content: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<string>("Processing");
  const [progressPercent, setProgressPercent] = useState(0);

  const handleSummarize = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setPhase("Processing");
    setProgressPercent(0);
    setError(null);
    let data: {
      message?: string;
      phase?: string;
      gatheredPages?: number;
      totalPages?: number;
      status?: string;
      masterSummary?: {
        website_name: string;
        html_content: string;
      } | null;
    } | null = null;

    let interval: NodeJS.Timeout | null = null;
    try {
      setSummary(null);
      const response = await fetch("/api/summary", {
        method: "POST",
        body: new FormData(e.currentTarget),
      });

      const reader = response
        .body!.pipeThrough(new TextDecoderStream())
        .getReader();

      let progressPercentage = 0;
      let bufferObject = "";
      let streamCompleted = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        bufferObject += value ?? "";

        let newlineIndex;
        while ((newlineIndex = bufferObject.indexOf("\n")) !== -1) {
          const line = bufferObject.slice(0, newlineIndex).trim();
          bufferObject = bufferObject.slice(newlineIndex + 1);

          if (!line) continue;

          data = JSON.parse(line);
          if (data?.status && Number(data.status) >= 400) {
            throw new Error(data.message ?? "Summary failed.");
          }

          if (interval) clearInterval(interval);

          if (
            data?.phase === "Gathering Pages" ||
            data?.phase === "Analizing Link"
          ) {
            setPhase(
              `${data?.phase} ${data?.phase === "Gathering Pages" ? `${data?.gatheredPages || 0}/${data?.totalPages || 6}` : ""}`,
            );
            if (
              Math.round(
                ((data?.gatheredPages || 0) / (data?.totalPages || 6)) * 40,
              ) > progressPercentage
            ) {
              interval = setInterval(() => {
                if (
                  Math.round(
                    (((data?.gatheredPages || 0) + 1) /
                      (data?.totalPages || 6)) *
                      40,
                  ) === progressPercentage
                ) {
                  clearInterval(interval!);
                  return;
                }

                progressPercentage += 1;
                setProgressPercent(progressPercentage);
              }, 400);
            } else {
              interval = setInterval(() => {
                if (
                  Math.round(
                    (((data?.gatheredPages || 0) + 1) /
                      (data?.totalPages || 6)) *
                      40,
                  ) === progressPercentage
                ) {
                  clearInterval(interval!);
                  return;
                }

                progressPercentage += 1;
                setProgressPercent(progressPercentage);
              }, 2200);
            }
          } else if (data?.phase === "Summarizing Pages") {
            setPhase(data?.phase);
            if (40 > progressPercentage) {
              interval = setInterval(() => {
                progressPercentage += 1;
                setProgressPercent(progressPercentage);
                if (96 === progressPercentage) {
                  clearInterval(interval!);
                  return;
                }
              }, 1500);
            } else {
              interval = setInterval(() => {
                if (progressPercentage === 96) {
                  clearInterval(interval!);
                  return;
                }

                progressPercentage += 1;
                setProgressPercent(progressPercentage);
              }, 1500);
            }
          } else if (data?.phase === "Summary Completed") {
            setPhase(data?.phase);
            if (100 > progressPercentage) {
              interval = setInterval(() => {
                if (100 === progressPercentage) {
                  clearInterval(interval!);
                  setPhase(data?.phase || "");
                  setSummary(data?.masterSummary ?? null);
                  setIsLoading(false);
                  streamCompleted = true;
                  return;
                }

                progressPercentage += 1;
                setProgressPercent(progressPercentage);
              }, 400);
            }
          }
        }
      }
      if (!streamCompleted) {
        throw new Error(
          "The server ended the connection before completing the summary.",
        );
      }
    } catch (e) {
      setError(
        typeof data === "string"
          ? data
          : (data?.message ??
              "An error occurred while summarizing the webpage."),
      );
      if (interval) clearInterval(interval);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background px-6 py-12 text-[#17212b] sm:px-10 lg:px-16">
      {isLoading === true && (
        <div className="bg-black/30 fixed left-0 right-0 top-0 bottom-0 "></div>
      )}
      <section className="mx-auto w-full max-w-6xl z-[1]">
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
            <p className="mb-4 text-sm font-medium text-orange-700/70">
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
              {error && (
                <p aria-live="polite" className="mt-2 text-sm text-red-600">
                  {error}
                </p>
              )}
            </form>
          </div>

          <aside
            aria-label="Summary output preview"
            className="min-h-72 border border-[#dbe3ee] bg-white p-6 sm:p-8"
          >
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <p className="text-xs font-semibold tracking-[0.1em] text-blue-700/70">
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
        {isLoading && (
          <div
            className="w-[500px] h-[150px] bg-white p-6 rounded-xl border border-white/5 flex flex-col justify-center
                  shadow-2xl shadow-black/80 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="flex justify-between items-center mb-3 text-xs font-bold tracking-wider">
              <span className="text-blue-400/70 uppercase">{phase}...</span>
              <span
                id="percent-text"
                className="text-blue-400/70 drop-shadow-[0_0_8px_rgba(0,210,255,0.4)] text-sm transition-all duration-300"
              >
                {progressPercent}%
              </span>
            </div>

            <div className="relative w-full h-3.5 bg-[#060913] rounded-full overflow-hidden border border-white/10">
              <div
                id="progress-bar"
                style={{
                  width: `${progressPercent}%`,
                  transition: "width 0.8s ease-out",
                }}

                className="h-full  bg-gradient-to-r from-[#0052d4] via-[#4364f7] to-[#6fb1fc] 
              rounded-full relative transition-[width] shadow-[0_0_12px_#4364f7]"
              >
                <div
                  id="shimmer"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full"
                ></div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
