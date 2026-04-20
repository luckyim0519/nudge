"use client";

import { useState, useRef } from "react";
import { Camera, Send } from "lucide-react";

interface PostFormProps {
  groupId: string;
  userId: string;
  onPosted: () => void;
}

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function PostForm({ groupId, userId, onPosted }: PostFormProps) {
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function compressPhoto(file: File): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 1080;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        canvas.toBlob(
          (blob) => resolve(new File([blob!], file.name, { type: "image/jpeg" })),
          "image/jpeg",
          0.8 // 80% quality
        );
      };
      img.src = url;
    });
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert("사진은 20MB 이하만 올릴 수 있어요");
      return;
    }
    const compressed = await compressPhoto(file);
    setPhoto(compressed);
    setPhotoPreview(URL.createObjectURL(compressed));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);

    if (DEMO_MODE) {
      // Simulate posting in demo mode
      await new Promise((r) => setTimeout(r, 400));
      setText("");
      setPhoto(null);
      setPhotoPreview(null);
      setLoading(false);
      onPosted();
      return;
    }

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    let photo_url: string | null = null;

    if (photo) {
      const ext = photo.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("post-photos")
        .upload(path, photo);
      if (!uploadError) {
        const { data } = supabase.storage.from("post-photos").getPublicUrl(path);
        photo_url = data.publicUrl;
      }
    }

    await supabase.from("posts").insert({
      group_id: groupId,
      user_id: userId,
      content: text.trim(),
      photo_url,
    });

    setText("");
    setPhoto(null);
    setPhotoPreview(null);
    setLoading(false);
    onPosted();
  }

  return (
    <div className="bg-white border-t border-sand px-4 pt-3 pb-4">
      {photoPreview && (
        <div className="relative w-16 h-16 rounded-xl overflow-hidden mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
          <button
            onClick={() => { setPhoto(null); setPhotoPreview(null); }}
            className="absolute top-0.5 right-0.5 w-4 h-4 bg-dark/70 rounded-full text-white text-[10px] flex items-center justify-center"
          >
            ×
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="shrink-0 w-10 h-10 rounded-xl bg-sand flex items-center justify-center text-dark/50"
        >
          <Camera size={18} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
        <input
          type="text"
          placeholder="오늘 뭐 했어? ✏️"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 100))}
          className="flex-1 h-10 px-3 rounded-xl bg-sand text-sm text-dark placeholder:text-dark/30 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="shrink-0 w-10 h-10 rounded-xl bg-amber flex items-center justify-center disabled:opacity-40"
        >
          <Send size={16} className="text-dark" />
        </button>
      </form>
      <div className="flex justify-end mt-1">
        <span className="text-xs text-dark/30">{text.length}/100</span>
      </div>
    </div>
  );
}
