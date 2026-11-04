export default function Hero() {
  return (
    <main className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-background px-6 py-12 text-[#17212b] sm:px-10 lg:px-16">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 hidden w-[43%] bg-blue-100/70 lg:block"
      />
      <section className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="max-w-xl">
          <p className="mb-6 flex items-center gap-3 text-xs font-semibold tracking-[0.12em] text-blue-700">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full bg-orange-500"
            />
            A CLEARER WAY TO READ THE WEB
          </p>
          <h1 className="text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
            Long reads
            <br />
            <span className="font-serif font-normal italic text-orange-700">
              made brief.
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-gray-700">
            Get the key points from any webpage, without reading every word.
          </p>
          <a
            href="#sample-brief"
            className="mt-8 inline-flex min-h-12 items-center justify-center bg-[#2563eb] px-5 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
          >
            Start Now
          </a>
        </div>

        <article
          id="sample-brief"
          aria-label="Example webpage and Briefy summary"
          className="w-full min-w-0 border border-gray-300 bg-white shadow-[10px_12px_0_#cbdcf5]"
        >
          <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
            </div>
            <p className="text-sm font-bold text-gray-700">Briefy preview</p>
          </header>

          <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
            <p className="mb-1 text-[11px] font-semibold tracking-[0.1em] text-gray-500">
              WEBPAGE
            </p>
            <p className="truncate text-sm text-gray-600">
              techreview.example/edge-computing
            </p>
          </div>

          <div className="grid md:grid-cols-2">
            <section className="min-w-0 border-b border-gray-200 bg-gray-50 px-4 py-5 md:border-b-0 md:border-r sm:px-6 sm:py-7">
              <p className="mb-4 text-[11px] font-semibold tracking-[0.1em] text-gray-500">
                THE WEBPAGE
              </p>
              <h2 className="text-lg font-bold leading-6 text-gray-900 sm:text-xl">
                The Power of Edge Computing
              </h2>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                Traditional servers are too slow for modern user needs.
                Companies are moving processing closer to users to reduce lag,
                but syncing data across locations is still a challenge.
              </p>
              <p className="mt-6 border-t border-gray-200 pt-3 text-xs text-gray-500">
                Original read: 8 minutes
              </p>
            </section>

            <section className="min-w-0 px-4 py-5 sm:px-6 sm:py-7">
              <p className="mb-4 text-[11px] font-semibold tracking-[0.1em] text-blue-700">
                THE BRIEF
              </p>
              <p className="text-sm leading-6 text-gray-700">
                Edge computing processes data near the user, making apps more
                responsive while creating new data-sync challenges.
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-5 text-gray-800">
                <li className="flex gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500"
                  />
                  Faster response times for users
                </li>
                <li className="flex gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500"
                  />
                  More complex data synchronization
                </li>
              </ul>
              <p className="mt-6 border-t border-gray-200 pt-3 text-xs font-medium text-blue-700">
                Summary read: 1 minute
              </p>
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}
