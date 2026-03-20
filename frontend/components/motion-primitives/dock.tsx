"use client";
import { bacasime, arizonia } from "@/styles/fonts";
import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from "motion/react";
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const DOCK_HEIGHT = 128;
const DEFAULT_MAGNIFICATION = 80;
const DEFAULT_DISTANCE = 150;
const DEFAULT_PANEL_HEIGHT = 64;

export type DockProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
  orientation?: "horizontal" | "vertical";
};

export type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  text?: string;
};

export type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
  [key: string]: unknown;
};

export type DockIconProps = {
  className?: string;
  children: React.ReactNode;
  [key: string]: unknown;
};

export type DocContextType = {
  mousePos: MotionValue;
  spring: SpringOptions;
  magnification: number;
  distance: number;
  orientation: "horizontal" | "vertical";
  text?: string;
};

export type DockProviderProps = {
  children: React.ReactNode;
  value: DocContextType;
};

const DockContext = createContext<DocContextType | undefined>(undefined);

function DockProvider({ children, value }: DockProviderProps) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error("useDock must be used within an DockProvider");
  }
  return context;
}

function Dock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
  orientation = "horizontal",
  text,
}: DockProps) {
  const mousePos = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const isVertical = orientation === "vertical";

  const maxHeight = useMemo(() => {
    return Math.max(DOCK_HEIGHT, magnification + magnification / 2 + 4);
  }, [magnification]);

  const crossAxisRow = useTransform(
    isHovered,
    [0, 1],
    [panelHeight, maxHeight],
  );
  const crossAxisSize = useSpring(crossAxisRow, spring);

  return (
    <motion.div
      style={{
        height: isVertical ? "auto" : crossAxisSize,
        width: isVertical ? crossAxisSize : "auto",
        scrollbarWidth: "none",
      }}
      className={cn(
        "flex",
        isVertical
          ? "my-2 max-h-full items-center overflow-visible"
          : "mx-2 max-w-full items-end overflow-visible",
      )}
    >
      <motion.div
        onMouseMove={({ pageX, pageY }) => {
          isHovered.set(1);
          mousePos.set(isVertical ? pageY : pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mousePos.set(Infinity);
        }}
        className={cn(
          "mx-auto flex w-fit gap-4 border-gray-200 rounded-2xl bg-white shadow-lg dark:bg-neutral-900",
          isVertical ? "my-auto flex-col py-4" : "px-4",
          className,
        )}
        style={{
          height: isVertical ? "auto" : panelHeight,
          width: isVertical ? panelHeight : "auto",
        }}
        role="toolbar"
        aria-label="Application dock"
      >
        <DockProvider
          value={{
            mousePos,
            spring,
            distance,
            magnification,
            orientation,
            text,
          }}
        >
          {children}
        </DockProvider>
      </motion.div>
    </motion.div>
  );
}

function DockItem({ children, className, onClick, text }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { distance, magnification, mousePos, spring, orientation } = useDock();
  const isVertical = orientation === "vertical";

  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mousePos, (val) => {
    const domRect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };

    if (isVertical) {
      return val - domRect.y - domRect.height / 2;
    }

    return val - domRect.x - domRect.width / 2;
  });

  const sizeTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [40, magnification, 40],
  );

  const size = useSpring(sizeTransform, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: isVertical ? "auto" : size,
        height: isVertical ? size : "auto",
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      className={cn(
        "relative inline-flex items-center justify-center font-",
        className,
      )}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      onClick={onClick}
    >
      {text && <DockLabel isHovered={isHovered}>{text}</DockLabel>}
      {Children.map(children, (child) =>
        cloneElement(
          child as React.ReactElement,
          {
            size,
            width: size,
            isHovered,
          } as Record<string, unknown>,
        ),
      )}
    </motion.div>
  );
}

function DockLabel({ children, className, ...rest }: DockLabelProps) {
  const restProps = rest as Record<string, unknown>;
  const isHovered = restProps["isHovered"] as MotionValue<number>;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });

    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            `absolute ${bacasime.className} right-0 whitespace-pre rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white shadow-lg`,
            className,
          )}
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className, ...rest }: DockIconProps) {
  const restProps = rest as Record<string, unknown>;
  const size =
    (restProps["size"] as MotionValue<number>) ??
    (restProps["width"] as MotionValue<number>);

  const sizeTransform = useTransform(size, (val) => val / 2);

  return (
    <motion.div
      style={{ width: sizeTransform, height: sizeTransform }}
      className={cn("flex items-center justify-center", className)}
    >
      {children}
    </motion.div>
  );
}

export { Dock, DockIcon, DockItem, DockLabel };
