"use client";
import React from "react";
import DragDropFiles from "@/components/drag-drop-files";
import { bacasime, arizonia, garamond } from "@/styles/fonts";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
const Onboarding = () => {
  return (
    <Dialog open={true}>
      <DialogContent className="bg-white border-2 border-[#111] shadow-[6px_6px_0_#111] font-serif p-0 gap-0 rounded-none overflow-hidden fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-w-[95%]">
        <form>
          <div className="flex items-center gap-2 p-10px bg-[#111] px-5 py-2.5">
            <div className="w-2 h-2 rounded-full bg-white opacity-35"></div>
            <div className="w-2 h-2 opacity-35 bg-white rounded-full" />
            <div className="w-2 h-2 bg-white rounded-full" />
            <span className="text-white font-mono text-[11px] tracking-[0.15em] ml-auto opacity-60"></span>
          </div>

          <div className="pt-7 px-6 pb-5">
            <div className="pl-3 mb-6 border-l-[3px] border-[#111]">
              <div className="font-mono text-[10px] tracking-[0.2em] text-[#888] uppercase mb-1">
                Onboarding
              </div>
            </div>
            <div
              className={`text-[15px] text-gray-500 ${bacasime.className} mb-4`}
            >
              Welcome to Truly Yours! We respect your privacy and all uploaded
              artworks will be discarded after procesing your style (never
              shared).
            </div>
          </div>
          <div className="mt-[-200px] mb-[-200px]">
            <DragDropFiles />
          </div>

          <DialogFooter></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Onboarding;
