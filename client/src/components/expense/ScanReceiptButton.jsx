import { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import CategoryIcon, { CATEGORIES } from './CategoryIcon';

const SCAN_MESSAGES = [
  'Reading your bill…',
  'Detecting amount…',
  'Finding category…',
  'Extracting details…',
];

export default function ScanReceiptButton({ onScanComplete }) {
  const [isScanning, setIsScanning] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const hasTouchCamera = typeof window !== 'undefined'
    ? window.matchMedia('(pointer: coarse)').matches
    : false;

  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % SCAN_MESSAGES.length);
      setCategoryIndex((i) => (i + 1) % CATEGORIES.length);
    }, 800);
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsScanning(true);
    setMessageIndex(0);
    setCategoryIndex(0);

    try {
      const base64 = await toBase64(file);
      const res = await fetch('/.netlify/functions/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: 'image/jpeg' }),
      });

      if (!res.ok) {
        toast.error("Couldn't read this receipt clearly. Please add it manually.");
        return;
      }

      const extracted = await res.json();
      const hasAnyData = extracted.amount || extracted.category || extracted.description;

      if (!hasAnyData) {
        toast.warning('Could not extract details. Please fill in manually.');
        return;
      }

      toast.success('Receipt scanned!');
      onScanComplete(extracted);
    } catch {
      toast.error("Couldn't read this receipt clearly. Please add it manually.");
    } finally {
      setIsScanning(false);
    }
  };

  /* ── Scanning State: Safarnama Animated Beam Card ─────────── */
  if (isScanning) {
    return (
      <div className="w-full max-w-xs mb-4 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] p-4 flex flex-col items-center gap-3">
        {/* Receipt silhouette + scan beam */}
        <div className="relative w-14 h-[76px] rounded-md overflow-hidden bg-white/[0.06] ring-1 ring-white/[0.10] flex flex-col justify-center gap-[5px] px-2">
          {[85, 55, 75, 40, 90].map((w, i) => (
            <div
              key={i}
              className="h-[2px] rounded-full bg-white/[0.18]"
              style={{ width: `${w}%` }}
            />
          ))}

          {/* Amber scan beam — translateY only */}
          <div className="absolute inset-x-0 top-0 pointer-events-none">
            <div
              className="h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"
              style={{ animation: 'scan-beam 1.4s cubic-bezier(0.65,0,0.35,1) infinite alternate' }}
            />
            <div
              className="h-8 bg-gradient-to-b from-amber-400/10 to-transparent"
              style={{ animation: 'scan-beam 1.4s cubic-bezier(0.65,0,0.35,1) infinite alternate' }}
            />
          </div>
        </div>

        {/* Category icon carousel */}
        <div className="transition-opacity duration-300">
          <CategoryIcon category={CATEGORIES[categoryIndex]} size={28} />
        </div>

        {/* Status text in data-mono */}
        <p className="text-[11px] font-mono text-muted-foreground tracking-wide transition-opacity duration-300">
          {SCAN_MESSAGES[messageIndex]}
        </p>
      </div>
    );
  }

  /* ── Idle State: Device-Aware Upload/Scan Trigger ──────────── */
  return (
    <div className="flex gap-2 w-full max-w-xs mb-4">
      {hasTouchCamera && (
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      )}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {hasTouchCamera && (
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] text-muted-foreground text-sm hover:bg-white/[0.08] hover:text-foreground active:scale-95 transition-all duration-150"
        >
          <Camera className="w-4 h-4" strokeWidth={1.5} />
          <span>Scan Receipt</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => galleryRef.current?.click()}
        className={`${hasTouchCamera ? 'flex-1' : 'w-full'} h-11 flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] text-muted-foreground text-sm hover:bg-white/[0.08] hover:text-foreground active:scale-95 transition-all duration-150`}
      >
        <ImagePlus className="w-4 h-4" strokeWidth={1.5} />
        <span>{hasTouchCamera ? 'From Gallery' : 'Upload Receipt'}</span>
      </button>
    </div>
  );
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 1280;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      resolve(dataUrl.split(',')[1]);
    };
    img.onerror = reject;
    img.src = url;
  });
}

