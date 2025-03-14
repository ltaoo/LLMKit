import { Result } from "@/domains/result";
import { ImageCore } from "./index";

export function connect($img: HTMLDivElement, store: ImageCore) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          store.handleShow();
          //   $img.src = src;
          //   $img.classList.add("visible");
          //   if (has_visible_ref.current === false) {
          //     set_visible(true);
          //   }
          //   has_visible_ref.current = true;
          io.unobserve($img);
        }
      });
    },
    { threshold: 0.01 }
  );
  io.observe($img);
  store.fetch_size = () => {
    const url = store.src;
    if (!url) {
      return Promise.resolve(Result.Err("图片地址为空"));
    }
    const img = new Image();
    img.src = url;
    const r: Promise<Result<{ width: number; height: number }>> = new Promise((resolve) => {
      img.onload = () => {
        const { width, height } = img;
        console.log("[DOMAIN]ui/image - fetch_client", width, height);
        store.adjustSize(width, height);
        resolve(Result.Ok({ width, height }));
      };
      img.onerror = () => {
        resolve(Result.Err("图片加载失败"));
      };
    });
    return r;
  };
  store.setContainerSize({ width: $img.clientWidth, height: $img.clientHeight });
  store.setMounted();
}
