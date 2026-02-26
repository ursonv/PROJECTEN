import {
  LoaderFunctionArgs,
  data,
  redirect,
} from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { getSupabaseServerClient } from "~/utils/supabase.server";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

import SortableItem from "~/components/general/SortableItem";
import BlockCard from "~/components/general/BlockCard";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const folderId = params.folderId;

  const { data: folder } = await supabase
    .from("folders")
    .select("id, title")
    .eq("id", folderId)
    .single();

  if (!folder) throw new Response("Folder niet gevonden", { status: 404 });

  const { data: blocks } = await supabase
    .from("blocks")
    .select("*")
    .eq("folder_id", folderId)
    .order("order_index", { ascending: true });

  return data({ folder, blocks: blocks || [] }, { headers: response.headers });
}

export default function FolderDetailPage() {
  const { folder, blocks: initialBlocks } = useLoaderData<typeof loader>();
  const [blocks, setBlocks] = useState(initialBlocks);

  const [activeId, setActiveId] = useState<string | null>(null);

  const [overId, setOverId] = useState<string | null>(null);
  const [overPos, setOverPos] = useState<"left" | "right" | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active?.id ?? null);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) {
      setOverId(null);
      setOverPos(null);
      return;
    }

    const activeRect = active.rect.current.translated ?? active.rect.current.initial;
    const activeMiddleX = activeRect.left + activeRect.width / 2;

    const overRect = over.rect;
    const overMiddleX = overRect.left + overRect.width / 2;

    setOverId(over.id);
    setOverPos(activeMiddleX < overMiddleX ? "left" : "right"); 
  };

  const handleDragEnd = async (event: any) => {
    setActiveId(null);
    setOverId(null);
    setOverPos(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b: any) => b.id === active.id);
    const overIndex = blocks.findIndex((b: any) => b.id === over.id);

    let targetIndex = overPos === "right" ? overIndex + 1 : overIndex;

    if (oldIndex < targetIndex) targetIndex -= 1;

    const newBlocks = arrayMove(blocks, oldIndex, targetIndex)
      .map((b: any, i: number) => ({ ...b, order_index: i }));

    setBlocks(newBlocks);

    await fetch("/api/update-block-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBlocks.map(({ id, order_index }: any) => ({ id, order_index }))),
    });
  };


  const activeBlock = activeId ? blocks.find((b: any) => b.id === activeId) : null;

  return (
    <div>
      <p className="desc">
        <Link to="/projecten" className="desc__link">Projecten</Link>
        &nbsp; &gt; &nbsp; {folder.title}
      </p>

      <div className="secondary-button">
        <h2 data-tour="project-title">{folder.title}</h2>
        <Link to={`/blok-toevoegen?folderId=${folder.id}`} data-tour="project-button">
          <div className="secondary-button__box">
            <i className="fa-regular fa-square-plus"></i>
          </div>
        </Link>
      </div>

      {blocks.length === 0 && <p>Geen slides gevonden.</p>}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
      <SortableContext items={blocks.map((b: any) => b.id)} strategy={verticalListSortingStrategy}>
        <div className="row mt-3">
          {blocks.map((block: any) => {
            const beforePlaceholder =
              overId === block.id && overPos === "left" && activeId !== block.id;
            const afterPlaceholder =
              overId === block.id && overPos === "right" && activeId !== block.id;

            return (
              <React.Fragment key={block.id}>
                {beforePlaceholder && (
                  <div className="col-12 col-sm-6 col-md-3 pr-5 pb-4">
                    <div className="drop-placeholder" />
                  </div>
                )}

                <div className="col-12 col-sm-6 col-md-3 pr-5 pb-4">
                  <SortableItem id={block.id} isActiveDragged={activeId === block.id}>
                    {(handleProps) => <BlockCard block={block} handleProps={handleProps} />}
                  </SortableItem>
                </div>


                {afterPlaceholder && (
                  <div className="col-12 col-sm-6 col-md-3 pr-5 pb-4">
                    <div className="drop-placeholder" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </SortableContext>

        {typeof document !== "undefined" &&
          createPortal(
            <DragOverlay dropAnimation={{ duration: 150 }}>
              {activeBlock ? (
                <div className="drag-overlay">
                  <BlockCard block={activeBlock} />
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )
        }
      </DndContext>
    </div>
  );
}
