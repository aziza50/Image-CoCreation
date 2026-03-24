"use client";
import React, { useState } from "react";
import Lasso from "./lasso";
import {
  LassoSelect,
  Palette,
  MessagesSquare,
  Search,
  Cog,
} from "lucide-react";
import { Dock, DockIcon, DockItem } from "@/components/motion-primitives/dock";
function sideBar() {
  const [isLasso, setIsLasso] = useState(false);

  return (
    <>
      {isLasso && <Lasso imageURL="partial_image.jpeg" />}

      <div className="fixed right-0 justify-end top-1/2 -translate-y-1/2 px-4">
        <Dock orientation="vertical">
          {/* Lasso Select means render Lasso component */}
          <DockItem text="Lasso Select" onClick={() => setIsLasso(!isLasso)}>
            <DockIcon>
              <LassoSelect />
            </DockIcon>
          </DockItem>
          <DockItem text="Receive Suggestions">
            <DockIcon>
              <MessagesSquare />
            </DockIcon>
          </DockItem>
          <DockItem text="View Inspirations">
            <DockIcon>
              <Search />
            </DockIcon>
          </DockItem>
          <DockItem text="Palette & Similar Styles">
            <DockIcon>
              <Palette />
            </DockIcon>
          </DockItem>
          <DockItem text="Personal Style Configuration">
            <DockIcon>
              <Cog />
            </DockIcon>
          </DockItem>
        </Dock>
      </div>
    </>
  );
}

export default sideBar;
