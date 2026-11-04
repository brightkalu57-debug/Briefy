export default function Body() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="border-t border-[#dbe3ee] bg-white px-6 py-20 text-[#17212b] sm:px-10 sm:py-24 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 pb-12 md:grid-cols-[1fr_0.75fr] md:items-end md:gap-12">
          <div>
            <p className="mb-4 flex items-center gap-3 text-xs font-semibold tracking-[0.12em] text-blue-700">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-orange-500"
              />
              HOW BRIEFY WORKS
            </p>
            <h2
              id="how-it-works-title"
              className="max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl"
            >
              A clearer starting point for every webpage.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-gray-600 md:justify-self-end">
            Get oriented with a short overview, then decide which details are
            worth a closer read.
          </p>
        </div>

        <ol className="grid border-y border-[#dbe3ee] md:grid-cols-3">
          <li className="border-b border-[#dbe3ee] py-7 md:border-b-0 md:border-r md:pr-8 md:py-8">
            <p className="mb-6 text-sm font-semibold tabular-nums text-blue-700">
              01
            </p>
            <h3 className="text-lg font-semibold">Choose a webpage</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-600">
              Start with an article, guide, or other page you want to
              understand.
            </p>
          </li>
          <li className="border-b border-[#dbe3ee] py-7 md:border-b-0 md:border-r md:px-8 md:py-8">
            <p className="mb-6 text-sm font-semibold tabular-nums text-blue-700">
              02
            </p>
            <h3 className="text-lg font-semibold">Get the main ideas</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-600">
              See the central point and key details together in a concise brief.
            </p>
          </li>
          <li className="py-7 md:pl-8 md:py-8">
            <p className="mb-6 text-sm font-semibold tabular-nums text-blue-700">
              03
            </p>
            <h3 className="text-lg font-semibold">Decide what to read</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-600">
              Use the overview to choose what deserves your time and attention.
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}
