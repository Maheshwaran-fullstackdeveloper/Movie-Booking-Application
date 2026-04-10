import { useState } from "react";
import { dummyTrailers } from "../assets/assets";
import { PlayCircleIcon } from "lucide-react";

function TrailerSection() {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0]);

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden">
      <p className="text-gray-300 font-medium text-lg max-w-240 mx-auto">
        Trailers
      </p>
      {/* Aspect Ratio Container */}
      <div
        className="relative mt-6 w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl z-10"
        style={{
          height: 0,
          paddingBottom: "56.25%",
          backgroundColor: "#111",
        }}
      >
        <iframe
          width="100%"
          height="100%"
          src={`${currentTrailer.videoUrl}?autoplay=1&mute=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute top-0 left-0"
        ></iframe>
      </div>

      <div className="group grid grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto">
        {dummyTrailers.map((trailer) => (
          <div
            key={trailer.image}
            className="relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition max-md:h-20 cursor-pointer"
            onClick={() => {
              setCurrentTrailer(trailer);
            }}
          >
            <img
              src={trailer.image}
              alt="trailer"
              className="rounded-lg w-full h-full object-cover brightness-75"
            />
            <PlayCircleIcon
              strokeWidth={1.6}
              className="absolute top-1/2 left-1/2 w-5 md:w-8 h-5 md:h-8 transform -translate-x-1/2 -translate-y-1/2 text-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrailerSection;
