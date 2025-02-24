"use client";

import { cn } from "@/lib/cn";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("ryo.png");

  useEffect(() => {
    if (!image) return;

    const url = URL.createObjectURL(image);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12">
      <h1 className="font-semibold text-2xl">Shot on Stone.</h1>
      <input
        id="upload"
        hidden
        type="file"
        onChange={(e) => {
          const files = e.target.files;
          if (!files) return;

          setImage(files.item(0));
        }}
      />
      <label
        htmlFor="upload"
        className="px-6 py-2.5 bg-white text-black  /80 font-medium text-sm mt-6 cursor-pointer rounded-full"
        style={{
          boxShadow:
            "inset 6px 6px 8px rgba(25, 25, 25, 0.2), inset 0px 2px 8px rgba(55, 55, 55, 0.6), inset -3px -2px 4px rgba(255, 255, 255, 0.2), inset -2px -6px 12px rgba(0, 0, 0, 0.6)",
        }}
      >
        Upload
      </label>
      <Stone imageUrl={imageUrl} />
    </div>
  );
}

function Stone({ imageUrl }: { imageUrl: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [vector, setVector] = useState([0, 0]);
  const [useBackground, setUseBackground] = useState(true);
  const [size, setSize] = useState(1000);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const element = svgRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      setVector([event.x - rect.left, event.y - rect.top]);
    };

    window.addEventListener("mousemove", onMove);

    setSize(
      window.devicePixelRatio * Math.min(1000, document.body.clientWidth)
    );
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        className="w-[1000px] h-auto max-w-full aspect-square"
      >
        <defs>
          <filter id="spotlight">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.1"
              numOctaves="4"
              result="noise"
            />
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0
              0 0 0 0 0
              0 0 0 0 0
              1 1 1 0.2 0"
              result="alpha_map"
            />

            <feComposite
              in="alpha_map"
              in2="noise"
              operator="arithmetic"
              result="alpha_map_with_noise"
              k2="1"
              k3="-0.2"
            />
            <feDiffuseLighting
              in="alpha_map_with_noise"
              result="light"
              lightingColor="rgba(250,250,250,1)"
              diffuseConstant={1}
            >
              <fePointLight x={vector[0]} y={vector[1]} z="32" />
            </feDiffuseLighting>

            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.1"
              numOctaves="4"
              result="turbulence"
            />
            <feDisplacementMap
              in2="turbulence"
              in="SourceGraphic"
              result="source_with_displacement"
              scale="50"
              xChannelSelector="R"
              yChannelSelector="G"
            />

            <feComposite
              in="SourceGraphic"
              in2="light"
              operator="arithmetic"
              result="out1"
              k1="1"
            />

            <feDropShadow
              dx={(-vector[0] * 14) / 1000}
              dy={(-vector[1] * 14) / 1000}
              stdDeviation="20"
              floodColor="black"
              floodOpacity="1"
            />
          </filter>
        </defs>

        <g filter="url(#spotlight)">
          {useBackground && (
            <rect
              x="10%"
              y="10%"
              width="80%"
              height="80%"
              rx="20"
              stroke="0"
              style={{
                fill: "gray",
              }}
            />
          )}
          <image href={imageUrl} x="10%" y="10%" width="80%" height="80%" />
        </g>
      </svg>
      <div
        className="sticky bottom-2 p-2 rounded-full bg-neutral-800 text-sm"
        style={{
          boxShadow:
            "inset 6px 6px 8px rgba(25, 25, 25, 0.2), inset 0px 2px 8px rgba(55, 55, 55, 0.6), inset -3px -2px 4px rgba(255, 255, 255, 0.2), inset -2px -6px 12px rgba(0, 0, 0, 0.6)",
        }}
      >
        <button
          onClick={() => setUseBackground((prev) => !prev)}
          className={cn(
            "relative cursor-pointer text-neutral-400 px-4 py-2.5 rounded-full font-medium transition-colors",
            useBackground && "text-white"
          )}
        >
          Background
          <div
            className={cn(
              "absolute inset-0 bg-white/20 blur-sm rounded-full transition-opacity z-[-1]",
              !useBackground && "opacity-0"
            )}
          />
        </button>
      </div>
    </>
  );
}
