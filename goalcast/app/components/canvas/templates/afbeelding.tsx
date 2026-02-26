import { Group, Image as KonvaImage } from "react-konva";

export function renderAfbeeldingTemplate(image: HTMLImageElement | undefined | null) {
  if (!image) return null;

  const canvasWidth = 1920;
  const canvasHeight = 1080;

  const maxWidth = 1400;
  const maxHeight = 800;

  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const imgWidth = image.width * scale;
  const imgHeight = image.height * scale;

  const x = (canvasWidth - imgWidth) / 2;
  const y = (canvasHeight - imgHeight) / 2;

  return (
    <Group>
      <KonvaImage image={image} x={x} y={y} width={imgWidth} height={imgHeight} />
    </Group>
  );
}
