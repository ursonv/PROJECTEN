import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItemFolder({
  id,
  children,
  isActiveDragged = false,
}: {
  id: string;
  children: React.ReactNode;
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

  // meet hoogte voor nette placeholder
  const measureRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number>(0);

  React.useLayoutEffect(() => {
    if (measureRef.current) {
      const rect = measureRef.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [children]);

  const style: React.CSSProperties = {
    // === cruciaal: géén transforms van dnd-kit toepassen ===
    transform: "none",
    transition,
    pointerEvents: isDragging ? "none" : "auto",
  };

  const showSourcePlaceholder = isDragging || isActiveDragged;

  return (
    <div ref={setNodeRef} style={style} className="sortable-item" {...attributes} {...listeners}>
      {showSourcePlaceholder ? (
        <div className="drag-placeholder" style={{ height: height || 100, width: "100%" }} />
      ) : (
        <div ref={measureRef} className="sortable-item-content">
          {children}
        </div>
      )}
    </div>
  );
}
