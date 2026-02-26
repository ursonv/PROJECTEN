import { Group, Text, Rect, Image as KonvaImage } from "react-konva";

export type UpcomingGameTemplateProps = {
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  address: string;
  image: HTMLImageElement | null | undefined;
  accent1: string;
  accent2: string;
};

export function renderUpcomingGameTemplate(props: UpcomingGameTemplateProps) {
  const {
    homeTeam,
    awayTeam,
    date,
    time,
    address,
    image,
    accent1,
    accent2,
  } = props;

  const width = 1920;
  const height = 1080;

  const topSectionHeight = 140;
  const teamBarHeight = 90;
  const footerHeight = 100;

  const imageAreaHeight = height - topSectionHeight - footerHeight;
  const imageY = topSectionHeight;

  return (
    <Group>
      {/* MATCH DAY Titel */}
      <Rect
        x={(width - 500) / 2}
        y={40}
        width={500}
        height={80}
        fill={accent2}
        cornerRadius={10}
      />
      <Text
        text="MATCH DAY"
        x={0}
        y={52}
        width={width}
        align="center"
        fontSize={64}
        fontStyle="bold"
        fill="white"
      />

      {/* Afbeelding */}
      {image && (
        <KonvaImage
          image={image}
          height={450}
          width={(image.width / image.height) * 450}
          x={(width - (image.width / image.height) * 450) / 2}
          y={imageY + 70}
        />
      )}

      {/* Team bar */}
      <Rect
        x={0}
        y={imageY + imageAreaHeight - teamBarHeight}
        width={width}
        height={teamBarHeight}
        fill={accent2}
      />
      <Text
        text={homeTeam || "HOME TEAM"}
        x={width / 2 - 400}
        y={imageY + imageAreaHeight - teamBarHeight + 25}
        width={300}
        fontSize={34}
        fill="white"
        fontStyle="bold"
        align="right"
        ellipsis
      />
      <Text
        text="VS"
        x={width / 2 - 25}
        y={imageY + imageAreaHeight - teamBarHeight + 25}
        width={50}
        fontSize={34}
        fill={accent1}
        fontStyle="bold"
        align="center"
      />
      <Text
        text={awayTeam || "AWAY TEAM"}
        x={width / 2 + 100}
        y={imageY + imageAreaHeight - teamBarHeight + 25}
        width={300}
        fontSize={34}
        fill="white"
        fontStyle="bold"
        align="left"
        ellipsis
      />

      {/* Footer */}
      <Rect
        x={0}
        y={height - footerHeight}
        width={width}
        height={footerHeight}
        fill={accent2}
      />
      <Text
        text={`${date || "DATUM"}  |  ${time || "TIJD"}`}
        x={0}
        y={height - footerHeight + 20}
        width={width}
        align="center"
        fontSize={28}
        fill="white"
        fontStyle="bold"
      />
      <Text
        text={address || "Adres hier"}
        x={0}
        y={height - footerHeight + 58}
        width={width}
        align="center"
        fontSize={20}
        fill="white"
      />
    </Group>
  );
}
