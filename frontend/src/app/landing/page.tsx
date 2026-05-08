import React from "react";
import DragElements from "@/components/drag-elements";
import Image from "next/image";
import { italiana } from "@/styles/fonts";
const page = () => {
  const images = [
    "/images/image1_.jpg",
    "/images/image2_.jpg",
    "/images/image3.jpg",
    "/images/image4.jpg",
  ];
  const positions = [
    { top: "100px", left: "100px" },
    { top: "200px", left: "300px" },
    { top: "300px", left: "500px" },
    { top: "400px", left: "700px" },
  ];
  return (
    <div className="w-dvw h-dvh relative bg-black overflow-hidden">
      <h1
        className={`${italiana.className} text-white text-8xl mb-10 z-10 left-[500px] top-[300px] absolute`}
      >
        Truly Yours
      </h1>
      <p className="text-white text-2xl z-10 left-[550px] top-[400px] absolute w-100">
        Augment your creativity and imagination while maintaining your unique
        style and control over your artwork
      </p>
      <DragElements dragMomentum={true} className="p-30 md:p-40">
        {images.map((src, index) => (
          <div className="rounded-xl bg-white p-2">
            <Image
              draggable={false}
              key={index}
              src={src}
              alt={`Image ${index + 1}`}
              width={150}
              height={150}
              style={{ width: "100%", height: "100%", ...positions[index] }}
            />
          </div>
        ))}
      </DragElements>
    </div>
  );
};

export default page;
