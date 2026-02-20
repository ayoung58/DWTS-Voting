// Utility functions for the voting app

/**
 * Compress and convert an image file to Base64
 * @param file - The image file to compress
 * @param maxWidth - Maximum width in pixels (default: 400)
 * @param quality - JPEG quality from 0 to 1 (default: 0.7)
 * @returns Promise<string> - Base64 encoded image data URI
 */
export function compressAndConvertToBase64(
  file: File,
  maxWidth: number = 400,
  quality: number = 0.7,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * ratio;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Format timestamp to readable string
 */
export function formatTimestamp(timestamp: any): string {
  if (!timestamp) return "Unknown";
  const date = timestamp.toDate();
  return date.toLocaleString();
}

/**
 * Generate a browser fingerprint from canvas, screen, and user-agent signals.
 * Not perfectly unique but very hard for a casual user to change.
 */
export async function generateFingerprint(): Promise<string> {
  const components: string[] = [];

  // 1) User-agent
  components.push(navigator.userAgent);

  // 2) Screen dimensions & color depth
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

  // 3) Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // 4) Language
  components.push(navigator.language);

  // 5) Platform
  components.push(navigator.platform);

  // 6) Canvas fingerprint
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = '14px "Arial"';
      ctx.fillStyle = "#f60";
      ctx.fillRect(0, 0, 200, 50);
      ctx.fillStyle = "#069";
      ctx.fillText("DWTS-fingerprint🎭", 2, 15);
      ctx.fillStyle = "rgba(102,204,0,0.7)";
      ctx.fillText("DWTS-fingerprint🎭", 4, 17);
      components.push(canvas.toDataURL());
    }
  } catch {
    components.push("canvas-error");
  }

  // 7) WebGL renderer (bonus signal)
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (gl) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      if (ext) {
        components.push(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || "");
      }
    }
  } catch {
    components.push("webgl-error");
  }

  // Hash with SubtleCrypto (SHA-256)
  const raw = components.join("|");
  const msgBuffer = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Check if voting has already been done (localStorage + fingerprint combo)
 */
export function hasAlreadyVoted(): boolean {
  return localStorage.getItem("dwts-voted") === "true";
}

/**
 * Mark as voted in localStorage, also persist fingerprint
 */
export function markAsVoted(fingerprint?: string): void {
  localStorage.setItem("dwts-voted", "true");
  if (fingerprint) {
    localStorage.setItem("dwts-fingerprint", fingerprint);
  }
}

/**
 * Clear voted status (for testing)
 */
export function clearVotedStatus(): void {
  localStorage.removeItem("dwts-voted");
  localStorage.removeItem("dwts-fingerprint");
}

/**
 * Normalize judge score from 0-60 to 0-50 scale
 * @param rawScore - Raw judge score (0-60)
 * @returns Normalized score (0-50)
 */
export function normalizeJudgeScore(rawScore: number): number {
  return (rawScore / 60) * 50;
}
