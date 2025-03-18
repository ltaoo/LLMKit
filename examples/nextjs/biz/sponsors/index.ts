function chunk_array<T>(arr: T[], n: number) {
  const result = [];
  for (let i = 0; i < arr.length; i += n) {
    result.push(arr.slice(i, i + n));
  }
  return result;
}
function to_fixed(v: string | number) {
  return parseFloat(Number(v).toFixed(1));
}
export enum CoverLayerTypes {
  Whole,
  Section,
  // QRCodeSection,
  Title,
  Sponsor,
  // QRCode,
  Padding,
  Margin,
  Gutter,
}
type SponsorNode = {
  id: string;
  text: string;
  image: string;
  href: string;
  from: string;
};
type TitleNode = {
  id: string;
  title: string;
};
type SectionNode = {} & Pick<
  SectionPayload,
  | "id"
  | "num_per_line"
  | "max_width"
  | "title"
  | "gutter"
  | "shape"
  | "show_text"
  | "list"
>;
type BaseCoverLayer<U> = {
  [SubType in keyof U]: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: SubType;
    payload: U[SubType];
  };
}[keyof U];
export type CoverLayer = BaseCoverLayer<{
  [CoverLayerTypes.Whole]: { id: string };
  [CoverLayerTypes.Gutter]: { id: string };
  [CoverLayerTypes.Margin]: { id: string };
  [CoverLayerTypes.Padding]: { id: string };
  [CoverLayerTypes.Section]: SectionNode;
  // [CoverLayerTypes.QRCodeSection]: SectionNode;
  [CoverLayerTypes.Title]: TitleNode;
  [CoverLayerTypes.Sponsor]: SponsorNode;
  // [CoverLayerTypes.QRCode]: SponsorNode;
}>;
export type CardInSection = {
  id: string;
  text: string;
  image: string;
  href: string;
  from: string;
};
export type CardImageShape = "rounded" | "circle";
export type SectionPayload = {
  id: string;
  /** 该 section 标题 */
  title: string;
  /** sponsor 容器的内边距 暂时废弃 */
  // padding: number;
  /** sponsor 之间的间隔 */
  gutter: number;
  /** 每一行展示 sponsor 数量 */
  num_per_line: number;
  /** 是否展示 sponsor 名称 */
  show_text?: boolean;
  /** 该 section 最大宽度 */
  max_width?: number;
  /** sponsor 形状 */
  shape: CardImageShape;
  /** 该 section 从垂直线 y 位置处开始绘制  */
  initial_y?: number;
  /** 用于覆盖 node @todo 这个设计不好看怎么优化 */
  // override?: { type: CoverLayerTypes };
  /** sponsor 列表 */
  list: CardInSection[];
};
export type CanvasPayload = {
  sections: SectionPayload[];
};
export const WECHAT_AVATAR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCmFyaWEtbGFiZWw9IldlQ2hhdCIgcm9sZT0iaW1nIgp2aWV3Qm94PSIwIDAgNTEyIDUxMiIKZmlsbD0iI2ZmZiI+PHBhdGgKZD0ibTAgMEg1MTJWNTEySDAiCmZpbGw9IiMwMGM3MGEiLz48cGF0aCBkPSJNNDAyIDM2OWMyMy0xNyAzOC00MiAzOC03MCAwLTUxLTUwLTkyLTExMS05MnMtMTEwIDQxLTExMCA5MiA0OSA5MiAxMTAgOTJjMTMgMCAyNS0yIDM2LTUgNC0xIDggMCA5IDFsMjUgMTRjMyAyIDYgMCA1LTRsLTYtMjJjMC0zIDItNSA0LTZtLTExMC04NWExNSAxNSAwIDExMC0yOSAxNSAxNSAwIDAxMCAyOW03NCAwYTE1IDE1IDAgMTEwLTI5IDE1IDE1IDAgMDEwIDI5Ii8+PHBhdGggZD0iTTI1MCAxOThhMTggMTggMCAwMDAtMzUgMTggMTggMCAxMDAgMzVtLTg5IDBhMTggMTggMCAwMDAtMzUgMTggMTggMCAxMDAgMzVtNDQtOTNjNjYgMCAxMjEgNDEgMTMxIDkzLTY0LTQtMTQ3IDQ0LTEyMyAxMjgtMyAwLTI1IDItNTEtNi00LTEtOCAwLTExIDJsLTMwIDE3Yy0zIDEtNy0xLTYtNmw3LTI0YzEtNS0xLTgtNC0xMC0yOC0yMC00NS01MC00NS04MyAwLTYxIDU5LTExMSAxMzItMTExIi8+PC9zdmc+";
export const ALIPAY_AVATAR =
  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzM1NzM0NTIwOTY2IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE0MzEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHBhdGggZD0iTTEwMjQuMDUxMiA3MDEuMDMwNFYxOTYuODY0QTE5Ni45NjY0IDE5Ni45NjY0IDAgMCAwIDgyNy4xMzYgMEgxOTYuODY0QTE5Ni45NjY0IDE5Ni45NjY0IDAgMCAwIDAgMTk2Ljg2NHY2MzAuMjcyQTE5Ni45MTUyIDE5Ni45MTUyIDAgMCAwIDE5Ni44NjQgMTAyNGg2MzAuMjcyYTE5Ny4xMiAxOTcuMTIgMCAwIDAgMTkzLjg0MzItMTYyLjA5OTJjLTUyLjIyNC0yMi42MzA0LTI3OC41MjgtMTIwLjMyLTM5Ni40NDE2LTE3Ni42NC04OS43MDI0IDEwOC42OTc2LTE4My43MDU2IDE3My45MjY0LTMyNS4zMjQ4IDE3My45MjY0cy0yMzYuMTg1Ni04Ny4yNDQ4LTIyNC44MTkyLTE5NC4wNDhjNy40NzUyLTcwLjA0MTYgNTUuNTUyLTE4NC41NzYgMjY0LjI5NDQtMTY0Ljk2NjQgMTEwLjA4IDEwLjM0MjQgMTYwLjQwOTYgMzAuODczNiAyNTAuMTYzMiA2MC41MTg0IDIzLjE5MzYtNDIuNTk4NCA0Mi40OTYtODkuNDQ2NCA1Ny4xMzkyLTEzOS4yNjRIMjQ4LjA2NHYtMzkuNDI0aDE5Ni45MTUyVjMxMS4xNDI0SDIwNC44VjI2Ny43NzZoMjQwLjEyOFYxNjUuNjMyczIuMTUwNC0xNS45NzQ0IDE5LjgxNDQtMTUuOTc0NGg5OC40NTc2VjI2Ny43NzZoMjU2djQzLjQxNzZoLTI1NlYzODEuOTUyaDIwOC44NDQ4YTgwNS45OTA0IDgwNS45OTA0IDAgMCAxLTg0LjgzODQgMjEyLjY4NDhjNjAuNjcyIDIyLjAxNiAzMzYuNzkzNiAxMDYuMzkzNiAzMzYuNzkzNiAxMDYuMzkzNnpNMjgzLjU0NTYgNzkxLjYwMzJjLTE0OS42NTc2IDAtMTczLjMxMi05NC40NjQtMTY1LjM3Ni0xMzMuOTM5MiA3LjgzMzYtMzkuMzIxNiA1MS4yLTkwLjYyNCAxMzQuNC05MC42MjQgOTUuNTkwNCAwIDE4MS4yNDggMjQuNDczNiAyODQuMDU3NiA3NC41NDcyLTcyLjE5MiA5NC4wMDMyLTE2MC45MjE2IDE1MC4wMTYtMjUzLjA4MTYgMTUwLjAxNnoiIGZpbGw9IiMwMDlGRTgiIHAtaWQ9IjE0MzIiPjwvcGF0aD48L3N2Zz4=";

export function SponsorCanvas(props: { width: number; padding: number }) {
  const { width, padding: global_padding } = props;

  let _width = width;

  let uid = 1;

  function exchange(from: string, url: string) {
    if (from === "wechat") {
      return WECHAT_AVATAR;
    }
    if (from === "alipay") {
      return ALIPAY_AVATAR;
    }
    return url;
  }

  return {
    width: _width,
    padding: global_padding,
    setWidth(w: number) {
      _width = w;
    },
    drawSection(payload: SectionPayload, index: number) {
      const {
        title,
        gutter,
        show_text,
        max_width,
        num_per_line,
        list,
        initial_y = global_padding,
        shape,
      } = payload;
      const _point = { x: 0, y: 0 };
      function move_to(x: number, y: number) {
        _point.x = x;
        _point.y = y;
      }
      let _node_uid = 1;
      /** 每个元素的位置 用于交互 */
      const nodes: CoverLayer[] = [];
      move_to(_width / 2, initial_y);
      const title_height = 24;
      /** sponsor 名称与头像间的间距 */
      const text_margin_top_to_avatar = show_text ? 4 : 0;
      const text_height = show_text ? 18 : 0;
      /** 由于 text 是从基线开始绘制会导致 中文 渲染不完整 所以加一个 bottom pading */
      const title_bottom_padding = 6;
      const text_bottom_padding = show_text ? 4 : 0;
      /** sponsors 和 section 标题的上边距 */
      const sponsors_margin_top_to_title = 18;
      _point.y += title_height;
      // console.log("[BIZ]sponsors - draw section", title, _point);
      let result = `<text x="${_point.x}" y="${_point.y}" text-anchor="middle" class="sponsorkit-tier-title">${title}</text>`;
      // _node_uid += 1;
      // nodes.push({
      //   id: `${index}_title_${_node_uid}`,
      //   type: CoverLayerTypes.Title,
      //   x: global_padding,
      //   /** text 的 y 是文字的基线 所以 text 的 y 要减去其高度 */
      //   y: _point.y - title_height,
      //   width: _width - global_padding * 2,
      //   height: title_height + title_bottom_padding,
      //   payload: payload,
      // });
      _point.y += title_bottom_padding + sponsors_margin_top_to_title;
      const image_size = (() => {
        const w = max_width || _width - global_padding * 2;
        return to_fixed((w - (num_per_line - 1) * gutter) / num_per_line);
      })();

      /** 在水平方向上的绘制起点 要根据是否有 max_width 判断 */
      const left = max_width
        ? max_width / 2 - image_size / 2
        : global_padding + image_size / 2;
      _point.x = left;
      /** 往下移动 准备绘制 sponsors */
      // _point.y += sponsors_margin_top_to_title;

      const groups = chunk_array(list, num_per_line);
      for (let i = 0; i < groups.length; i += 1) {
        renderSponsorsPerLine(groups[i]);
        // 一行绘制完毕 水平方向上要恢复初始位置
        _point.x = left;
        // 垂直方向上往下移动 头像高度+名称与头像上边距+名称高度+sponsor间距 开始绘制下一行
        _point.y +=
          image_size +
          text_margin_top_to_avatar +
          text_height +
          (i < groups.length - 1 ? gutter : 0);
      }

      function renderSponsorsPerLine(list: CardInSection[]) {
        /** 如果一行 sponsor 数量不够一行 那么这些就要居中排列 */
        if (list.length <= num_per_line) {
          const w = (list.length - 1) * gutter + list.length * image_size;
          const container_width = _width;
          const left = container_width / 2 - w / 2 + image_size / 2;
          _point.x = left;
        }
        for (let i = 0; i < list.length; i += 1) {
          const { text, image: tmp, href = "#", from } = list[i];
          // console.log("[BIZ]sponsors - draw sponsor", text);
          const image = exchange(from, tmp);
          const image_point = {
            x: _point.x - image_size / 2,
            y: _point.y,
          };
          const text_point = {
            x: _point.x,
            y: _point.y + image_size + text_margin_top_to_avatar + text_height,
          };
          // console.log(
          //   "[BIZ]sponsors - draw sponsor",
          //   _point,
          //   text_point,
          //   image_size
          // );
          _node_uid += 1;
          nodes.push({
            id: `${index}_card_${_node_uid}`,
            type: CoverLayerTypes.Sponsor,
            x: image_point.x,
            y: image_point.y,
            width: image_size,
            height:
              image_size +
              text_margin_top_to_avatar +
              text_height +
              text_bottom_padding,
            payload: list[i],
          });
          const $name = show_text
            ? `<text x="${text_point.x}" y="${text_point.y}" text-anchor="middle" class="sponsorkit-name" fill="currentColor">${text}</text>`
            : "";
          const inner = `${$name}<clipPath id="c${uid}"><rect x="${
            image_point.x
          }" y="${
            image_point.y
          }" width="${image_size}" height="${image_size}" rx="${
            shape === "circle" ? image_size / 2 : image_size / 8
          }" ry="${
            shape === "circle" ? image_size / 2 : image_size / 8
          }" /></clipPath><image x="${image_point.x}" y="${
            image_point.y
          }" width="${image_size}" height="${image_size}" href="${image}" clip-path="url(#c${uid})" />`;
          result += (() => {
            if (!href || href === "#") {
              return inner;
            }
            return `<a href="${href}" class="sponsorkit-link" target="_blank" id="${text}">${inner}</a>`;
          })();
          uid += 1;
          _point.x += image_size + gutter;
        }
      }
      // console.log("[PAGE]before push Section node", _point.y, initial_y);
      _node_uid += 1;
      nodes.push({
        id: `${index}_section_${_node_uid}`,
        type: CoverLayerTypes.Section,
        x: 0,
        y: initial_y,
        width: _width,
        height: to_fixed(_point.y + text_bottom_padding - initial_y),
        payload: payload,
      });
      return {
        content: result,
        nodes,
        height: to_fixed(_point.y + text_bottom_padding),
        y: _point.y + text_bottom_padding + global_padding,
      };
    },
    load(payload: CanvasPayload) {
      let height = 0;
      let svg = "";
      const nodes: CoverLayer[] = [];
      let prev_y = undefined;
      for (let i = 0; i < payload.sections.length; i += 1) {
        const {
          id,
          title,
          num_per_line,
          max_width,
          gutter,
          show_text,
          // override,
          shape,
          list,
        } = payload.sections[i];
        // console.log(
        //   "[BIZ]sponsors - load draw section",
        //   title,
        //   num_per_line,
        //   gutter
        // );
        const r = this.drawSection(
          {
            id,
            title,
            num_per_line,
            max_width,
            gutter,
            show_text,
            shape,
            // override,
            initial_y: prev_y,
            list,
          },
          i
        );
        prev_y = r.y;
        svg += r.content;
        nodes.push(...r.nodes);
        height = r.height + global_padding;
      }
      nodes.push({
        id: "whole",
        type: CoverLayerTypes.Whole,
        x: 0,
        y: 0,
        width: _width,
        height,
        payload: { id: "whole" },
      });
      const state = {
        content: this.buildContent({ width: _width, height, content: svg }),
        nodes,
        width: _width,
        height,
      };
      return state;
    },
    buildContent(state: { width: number; height: number; content: string }) {
      const content = `<svg
          width="${state.width}"
          height="${state.height}"
          viewBox="0 0 ${state.width} ${state.height}"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>
          text {
            font-weight: 300;
            font-size: 14px;
            fill: #777777;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          .sponsorkit-link {
            cursor: pointer;
          }
          .sponsorkit-tier-title {
            font-weight: 500;
            font-size: 20px;
          }
          </style>
          ${state.content}
        </svg>`;
      return content;
    },
    exchange,
  };
}
