import React from "react";
import SideBar from "./components/side-bar";
import DragDrop from "./components/drag-drop";
import Title from "./components/title";
export default function Home() {
  return (
    <div>
      <div>
        <Title />
      </div>
      <SideBar />
      <DragDrop />
    </div>
  );
}
