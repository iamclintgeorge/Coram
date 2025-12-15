const Error404 = () => {
  return (
    <>
      <main className="grid min-h-full place-items-center bg-[#F5F5F5] px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold font-inter text-[#0C2340]">
            404
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl font-playfair">
            Page not found!
          </h1>
          <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 font-inter">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/"
              className="rounded-sm bg-[#0C2340] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#F5F5F5] hover:text-[#0C2340] focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Go back home
            </a>
          </div>
        </div>
      </main>
    </>
  );
};

export default Error404;
