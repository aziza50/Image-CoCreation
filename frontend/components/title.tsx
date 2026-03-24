"use client";
import React from "react";
import { arizonia } from "../styles/fonts";

function title() {
  const [artTitle, setArtTitle] = React.useState("Untitled Artwork");
  return (
    <div>
      <input
        value={artTitle}
        onChange={(e) => setArtTitle(e.target.value)}
        className={`p-2 text-2xl font-bold ${arizonia.className}`}
      ></input>
    </div>
  );
}

export default title;
