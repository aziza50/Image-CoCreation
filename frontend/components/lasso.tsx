"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { getUserArtwork } from "@/src/app/dashboard/actions";
import { bacasime } from "@/styles/fonts";

type LassoProps = {
  imageRef: React.RefObject<HTMLImageElement | null>;
  onMask?: (blob: Blob) => void;
};

interface artwork {
  id: string;
  s3_url: string;
  s3_key: string;
  updated_at: string;
}

function Lasso({ imageRef, onMask }: LassoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const points = useRef<[number, number][]>([]);
  const blobSizeRef = useRef(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [artwork, setArtwork] = useState<artwork | null>(null);
  const [dataURL, setDataURL] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [token, setToken] = useState<string | null>(null);
  const [mouseUp, setMouseUp] = useState(false);
  const [image, setImage] = useState<Blob | null>(null);
  const [inputValue, setInputValue] = useState("");
  useEffect(() => {
    async function fetchUserId() {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user ID:", error);
        return;
      }
      setUserId(user?.id || null);
    }
    fetchUserId();
  }, []);

  useEffect(() => {
    async function getToken() {
      const supabase = createClient();
      const token = await supabase.auth.getSession();
      setToken(token?.data?.session?.access_token || null);
    }
    getToken();
  }, []);

  useEffect(() => {
    //check if user already has an artwork
    async function fetchUserArtwork(user_id: string) {
      const response = await getUserArtwork(user_id);
      if (response.success) {
        setArtwork(response.data as unknown as artwork);
        setDataURL(response.data.s3_url);
        const fetchImg = await fetch(`${response.data.s3_url}`, {
          mode: "cors",
          headers: {
            Accept: "image/png",
          },
        });
        //resize image to imgRef to match canvas

        const image = await fetchImg.blob();
        setImage(image);
      } else {
        toast.error("Failed to fetch user artwork.");
      }
    }
    if (userId) {
      fetchUserArtwork(userId);
    }
  }, [userId]);
  useEffect(() => {
    const img = imageRef?.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const syncCanvasSize = () => {
      canvas.width = img.clientWidth;
      canvas.height = img.clientHeight;
    };

    if (img.complete) {
      syncCanvasSize();
    } else {
      img.addEventListener("load", syncCanvasSize);
    }

    window.addEventListener("resize", syncCanvasSize);

    return () => {
      img.removeEventListener("load", syncCanvasSize);
      window.removeEventListener("resize", syncCanvasSize);
    };
  }, [imageRef]);
  console.log(dataURL);
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(points.current[0][0], points.current[0][1]);
    for (const [x, y] of points.current) {
      ctx.lineTo(x, y);
    }
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fill();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = false;
    const pos = getPos(e);
    setCursorPos({ x: pos[0], y: pos[1] });
    setMouseUp(true);
  };

  const extractMask = () => {
    const canvas = canvasRef.current!;
    const img = imageRef.current!;

    const maskCanvas = document.createElement("canvas");
    console.log(canvas.width, canvas.height);
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext("2d")!;
    maskCtx.fillStyle = "white";
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCtx.beginPath();
    points.current.forEach(([x, y], index) => {
      if (index === 0) {
        maskCtx.moveTo(x, y);
      } else {
        maskCtx.lineTo(x, y);
      }
    });
    maskCtx.closePath();

    maskCtx.fillStyle = "black";
    maskCtx.fill();

    const imageCanvas = document.createElement("canvas");
    imageCanvas.width = canvas.width;
    imageCanvas.height = canvas.height;
    const imgCtx = imageCanvas.getContext("2d")!;
    img.crossOrigin = "anonymous";

    imgCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
    maskCanvas.toBlob(async (maskBlob) => {
      imageCanvas.toBlob(async (imageBlob) => {
        if (!maskBlob || !imageBlob) return;
        if (onMask) onMask(maskBlob);
        const formData = new FormData();

        formData.append("mask_input", maskBlob, "lasso.png");
        formData.append("image_input", imageBlob, "image.png");
        formData.append("prompt", inputValue);
        formData.append("s3_key", artwork ? artwork.s3_key : "");
        formData.append("token", token || "");
        try {
          const response = await fetch("/api/lasso-suggestion", {
            method: "POST",
            body: formData,
          });
          if (!response.ok) {
            const error = await response.json();
            if (response.status === 429) {
              alert("Rate limit exceeded. Please try again later.");
            } else
              alert(
                `Error generating suggestion: ${error.error || "Unknown error"}`,
              );
            return;
          }
        } catch (error) {
          toast.error("Lasso upload error");
        } finally {
          setInputValue("");
        }
      });
    });

    const ctx = canvas.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(points.current[0][0], points.current[0][1]);
    for (const [x, y] of points.current) {
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fill();
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        style={{ display: "block" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      {mouseUp && cursorPos && (
        <Input
          style={{
            position: "absolute",
            left: cursorPos.x,
            top: cursorPos.y,
            zIndex: 10,
          }}
          className={`bg-white border-none max-w-xs ${bacasime.className}`}
          placeholder="Enter your prompt"
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => setMouseUp(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setMouseUp(false);
              extractMask();
            }
          }}
          value={inputValue}
        ></Input>
      )}
    </>
  );
}

export default Lasso;
