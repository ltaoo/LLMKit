import { Result } from "@/domains/result";

export function loadImage(data: string): Promise<Result<HTMLImageElement>> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(Result.Ok(img));
    };
    img.onerror = (msg) => {
      resolve(Result.Err(msg as string));
    };
    img.src = data;
  });
}

export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result;
      resolve(buffer as ArrayBuffer);
    };
    reader.readAsArrayBuffer(blob);
  });
}

export function readFileAsURL(file: File): Promise<Result<string>> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target === null) {
        return resolve(Result.Err("read failed"));
      }
      resolve(Result.Ok(reader.result as string));
    };
    reader.readAsDataURL(file);
  });
}

export function textToURL(text: string, type: string) {
  const base64SVG = btoa(encodeURIComponent(text));
  const dataURL = `data:${type};base64,${base64SVG}`;
  return dataURL;
}
export function textToFileURL(text: string, type: string) {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  return URL.createObjectURL(blob);
}

export function readFileAsArrayBuffer(
  file: File
): Promise<Result<ArrayBuffer>> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target === null) {
        return resolve(Result.Err("read failed"));
      }
      const buffer = e.target.result;
      return resolve(Result.Ok(buffer as ArrayBuffer));
    };
    reader.readAsArrayBuffer(file);
  });
}

export async function readFileAsText(file: File): Promise<Result<string>> {
  const r = await readFileAsArrayBuffer(file);
  if (r.error) {
    return Result.Err(r.error.message);
  }
  const decoder = new TextDecoder("utf-8");
  const content = decoder.decode(r.data);
  return Result.Ok(content);
}

export function base64ToFile(base64: string, filename: string) {
  const mimeType = base64.match(/^data:(.*);base64,/)![1];
  const base64Data = base64.replace(/^data:(.*);base64,/, "");
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}
