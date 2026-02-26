import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem({
  id,
  children,
  showDropLeft = false,
  showDropRight = false,
  isActiveDragged = false,
}: {
  id: string;
  children: (handleProps: React.HTMLAttributes<HTMLElement>) => React.ReactNode;
  showDropLeft?: boolean;
  showDropRight?: boolean;
  isActiveDragged?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const measureRef = React.useRef<HTMLDivElement>(null);

  const style: React.CSSProperties = {
    transform: isDragging ? "none" : CSS.Transform.toString(transform),
    transition,
    pointerEvents: isDragging ? "none" : "auto",
  };

  const handleProps = { ...attributes, ...listeners };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="sortable-item"
    >
      {isDragging ? (
        <div className="drag-placeholder" style={{ height: 200, width: "100%" }} />
      ) : (
        <div ref={measureRef} className="sortable-item-content">
          {children(handleProps)}
        </div>
      )}
    </div>
  );
}
