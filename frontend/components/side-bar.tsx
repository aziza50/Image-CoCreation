"use client";
import {
  LassoSelect,
  Palette,
  MessagesSquare,
  Search,
  Cog,
} from "lucide-react";
import { Dock, DockIcon, DockItem } from "@/components/motion-primitives/dock";

type SideBarProps = {
  onActionClick: (action: string) => void;
  activeAction: string | null;
};
function sideBar({ onActionClick, activeAction }: SideBarProps) {
  return (
    <>
      <div className="fixed right-0 justify-end top-1/2 -translate-y-1/2 px-4">
        <Dock orientation="vertical">
          <DockItem
            text="Lasso Select"
            isActive={activeAction === "Lasso Select"}
            onClick={() =>
              activeAction !== "Lasso Select"
                ? onActionClick("Lasso Select")
                : onActionClick("")
            }
          >
            <DockIcon>
              <LassoSelect />
            </DockIcon>
          </DockItem>
          <DockItem
            text="Receive Suggestions"
            isActive={activeAction === "Receive Suggestions"}
            onClick={() =>
              activeAction !== "Receive Suggestions"
                ? onActionClick("Receive Suggestions")
                : onActionClick("")
            }
          >
            <DockIcon>
              <MessagesSquare />
            </DockIcon>
          </DockItem>
          <DockItem
            text="View Inspirations"
            isActive={activeAction === "View Inspirations"}
            onClick={() =>
              activeAction !== "View Inspirations"
                ? onActionClick("View Inspirations")
                : onActionClick("")
            }
          >
            <DockIcon>
              <Search />
            </DockIcon>
          </DockItem>
          <DockItem
            text="Palette & Similar Styles"
            isActive={activeAction === "Palette & Similar Styles"}
            onClick={() =>
              activeAction !== "Palette & Similar Styles"
                ? onActionClick("Palette & Similar Styles")
                : onActionClick("")
            }
          >
            <DockIcon>
              <Palette />
            </DockIcon>
          </DockItem>
          <DockItem
            text="Personal Style Configuration"
            isActive={activeAction === "Personal Style Configuration"}
            onClick={() =>
              activeAction !== "Personal Style Configuration"
                ? onActionClick("Personal Style Configuration")
                : onActionClick("")
            }
          >
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
