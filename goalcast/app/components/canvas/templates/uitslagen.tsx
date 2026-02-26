import { Group, Rect, Text } from "react-konva";

export type TableRow = {
  id: string;
  values: string[];
  y: number;
  isMyTeam?: boolean;
};

type AccentColors = {
  headerFill: string;
  rowFill: string;
};

export function renderUitslagenTable(
  columns: string[],
  tableRows: TableRow[],
  accentColors: AccentColors
) {
  const cellHeight = 48;
  const baseWidth = 120;

  const cellWidths = columns.map((col) => (col === "CLUB" ? 320 : baseWidth));
  const tableWidth = cellWidths.reduce((a, b) => a + b, 0);

  const tableX = (1920 - tableWidth) / 2;
  const headerY = 200;
  const titleY = 120;

  return (
    <Group>
      {/* Tabeltitel */}
      <Text
        x={0}
        y={titleY}
        text="League Table"
        fontSize={60}
        fontStyle="bold"
        fill="#222"
        align="center"
        verticalAlign="middle"
        width={1920}
      />

      {/* Header */}
      {columns.map((col, idx) => (
        <Group
          key={`header-${idx}`}
          x={tableX + cellWidths.slice(0, idx).reduce((a, b) => a + b, 0)}
          y={headerY}
        >
          <Rect
            width={cellWidths[idx]}
            height={cellHeight}
            fill={accentColors.headerFill}
            stroke="white"
            strokeWidth={1}
          />
          <Text
            text={col}
            fontSize={22}
            fill="white"
            fontStyle="bold"
            align="center"
            verticalAlign="middle"
            width={cellWidths[idx]}
            height={cellHeight}
          />
        </Group>
      ))}

      {/* Data rows */}
      {tableRows.map((row, rowIdx) => (
        <Group
          key={row.id}
          x={tableX}
          y={headerY + cellHeight + rowIdx * cellHeight}
        >
          {row.values.map((val, idx) => (
            <Group key={idx} x={cellWidths.slice(0, idx).reduce((a, b) => a + b, 0)}>
              <Rect
                width={cellWidths[idx]}
                height={cellHeight}
                fill={row.isMyTeam ? "#DDA40B" : accentColors.rowFill}
                stroke="white"
                strokeWidth={0.5}
              />
              <Text
                text={val || "-"}
                fontSize={20}
                fill="white"
                align="center"
                verticalAlign="middle"
                width={cellWidths[idx]}
                height={cellHeight}
              />
            </Group>
          ))}
        </Group>
      ))}
    </Group>
  );
}
