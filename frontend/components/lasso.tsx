"use client";
import { useRef, useCallback } from "react";

function Lasso({ imageURL }: { imageURL: string }) {
  {
    /*Using useRef here as a reference to the canvas element this is background
    job so no need to render to user! */
  }
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const isDrawing = useRef(false);
  const points = useRef<[number, number][]>([]);

  const syncCanvasSize = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
  };
  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top] as [number, number];
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    points.current = [getPos(e)];
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    points.current.push(getPos(e));

    ctx.clearRect(0, 0, canvas!.width, canvas!.height);
    ctx.beginPath();
    ctx.moveTo(points.current[0][0], points.current[0][1]);
    for (const [x, y] of points.current) {
      ctx.lineTo(x, y);
    }
    ctx.fillStyle = "rgba(0, 89, 220, 0.08)";
    ctx.strokeStyle = "rgba(0, 89, 220, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fill();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = false;
    extractMask();
  };

  const extractMask = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.beginPath();
    points.current.forEach(([x, y], index) => {
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("lasso", blob, "lasso.png");
      const response = await fetch("/api/lasso", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("Lasso mask uploaded, server response:", result, blob);
    });
  };
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative inline-block">
        <img
          ref={imgRef}
          onLoad={syncCanvasSize}
          src={imageURL}
          alt="Artwork"
          style={{
            maxWidth: "90vw",
            maxHeight: "80vh",
            display: "block",
            width: "auto",
            height: "auto",
          }}
          className="rounded-lg object-contain shadow-lg"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>
    </div>
  );
}

export default Lasso;
