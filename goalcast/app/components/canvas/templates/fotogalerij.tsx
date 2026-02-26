import { Group, Rect, Text, Image as KonvaImage } from "react-konva";

export type FotogalerijTemplateProps = {
  images: (HTMLImageElement | null | undefined)[]; 
  cols?: number; 
  gap?: number; 
  padding?: number; 
  rounded?: number; 
  title?: string; 
  accent1: string; 
  accent2: string;
};

const CANVAS_W = 1920;
const CANVAS_H = 1080;

function coverFit(
  img: HTMLImageElement,
  containerW: number,
  containerH: number
) {
  const scale = Math.max(containerW / img.width, containerH / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (containerW - w) / 2;
  const y = (containerH - h) / 2;
  return { x, y, w, h };
}

export function renderFotogalerijTemplate(props: FotogalerijTemplateProps) {
  const {
    images,
    cols = 3,
    gap = 20,
    padding = 60,
    rounded = 16,
    title,
    accent1,
    accent2,
  } = props;

  const titleBarHeight = title ? 120 : 60;
  const gridTop = title ? titleBarHeight : 40;
  const gridBottom = 40;

  const usableW = CANVAS_W - padding * 2;
  const usableH = CANVAS_H - gridTop - gridBottom - padding;

  const colCount = Math.max(1, Math.min(12, Math.round(cols)));
  const rowCount = Math.ceil((images?.length || 0) / colCount) || 1;

  const cellW = (usableW - gap * (colCount - 1)) / colCount;
  const cellH = (usableH - gap * (rowCount - 1)) / rowCount;

  const nodes: any[] = [];

  if (title) {
    nodes.push(
      <Rect
        key="title-pill"
        x={(CANVAS_W - 800) / 2}
        y={24}
        width={800}
        height={72}
        fill={accent2}
        cornerRadius={10}
      />
    );
    nodes.push(
      <Text
        key="title-text"
        text={title}
        x={0}
        y={40}
        width={CANVAS_W}
        align="center"
        fontSize={44}
        fontStyle="bold"
        fill="white"
      />
    );
  }

  const startX = padding;
  const startY = gridTop + padding / 2;

  images.forEach((img, idx) => {
    if (!img) return;
    const row = Math.floor(idx / colCount);
    const col = idx % colCount;

    const x = startX + col * (cellW + gap);
    const y = startY + row * (cellH + gap);

    nodes.push(
      <Group key={`cell-${idx}`} x={x} y={y} clip={{ x: 0, y: 0, width: cellW, height: cellH }}>
        <Rect width={cellW} height={cellH} fill={accent1} opacity={0.06} cornerRadius={rounded} />
        {(() => {
          const { x: ix, y: iy, w, h } = coverFit(img, cellW, cellH);
          return (
            <KonvaImage image={img} x={ix} y={iy} width={w} height={h} />
          );
        })()}

        <Rect width={cellW} height={cellH} stroke={accent1} strokeWidth={2} cornerRadius={rounded} opacity={0.25} />
      </Group>
    );
  });

  return <Group>{nodes}</Group>;
}