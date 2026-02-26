import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  data,
  redirect,
} from "@remix-run/node";
import { useLoaderData, Form, useSubmit } from "@remix-run/react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import { deleteFromGoalcast } from "~/utils/goalcast";
import Modal from "~/components/popup/Modal";
import UsbForm from "~/components/forms/UsbForm";

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

import SortableItemFolder from "~/components/general/SortableItemFolder";

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw redirect("/login");

  const [usbsResult, foldersResult, linksResult, blocksResult] = await Promise.all([
    supabase
      .from("usbs")
      .select("id, title, code, is_online, logo_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("folders").select("id, title").eq("user_id", user.id),
    supabase
      .from("folder_usb_links")
      .select("folder_id, usb_id, order_index")
      .order("order_index", { ascending: true }),
    supabase.from("blocks").select("folder_id").eq("user_id", user.id),
  ]);

  const countsByFolder =
    blocksResult.data?.reduce<Record<string, number>>((acc, block) => {
      const folderId = (block as any).folder_id;
      if (folderId) acc[folderId] = (acc[folderId] || 0) + 1;
      return acc;
    }, {}) || {};

  return data(
    {
      user,
      usbs: usbsResult.data || [],
      folders: foldersResult.data || [],
      links: linksResult.data || [],
      countsByFolder,
    },
    { headers: response.headers }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return data({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const intent = form.get("_intent");

  if (intent === "delete") {
    const id = form.get("id") as string;
    const { data: usb } = await supabase
      .from("usbs")
      .select("code, logo_url")
      .eq("id", id)
      .single();

    if (usb?.logo_url && usb?.code) {
      await deleteFromGoalcast(usb.code, usb.logo_url);
    }

    await supabase.from("usbs").delete().eq("id", id);
  }

  if (intent === "assign-folder") {
    const folderId = form.get("folder_id") as string;
    const usbId = form.get("usb_id") as string;

    const { data: maxOrder } = await supabase
      .from("folder_usb_links")
      .select("order_index")
      .eq("usb_id", usbId)
      .order("order_index", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextIndex = (maxOrder?.order_index ?? -1) + 1;

    await supabase.from("folder_usb_links").insert({
      folder_id: folderId,
      usb_id: usbId,
      order_index: nextIndex,
    });
  }

  if (intent === "remove-folder") {
    const folderId = form.get("folder_id") as string;
    const usbId = form.get("usb_id") as string;

    await supabase
      .from("folder_usb_links")
      .delete()
      .eq("folder_id", folderId)
      .eq("usb_id", usbId);
  }

  return redirect("/", { headers: response.headers });
}

export default function Index() {
  const { user, usbs, folders, links, countsByFolder } = useLoaderData<typeof loader>();
  const [selectedUsbId, setSelectedUsbId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const displayName =
    user.user_metadata?.firstName ||
    user.user_metadata?.full_name ||
    user.email;

  const linkedFoldersOrdered = useMemo(() => {
    if (!selectedUsbId) return [];
    const linksForUsb = links
      .filter((l: any) => l.usb_id === selectedUsbId)
      .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0));

    const byId = new Map(folders.map((f: any) => [f.id, f]));
    return linksForUsb
      .map((l: any) => byId.get(l.folder_id))
      .filter(Boolean)
      .map((f: any) => ({ id: f.id, title: f.title }));
  }, [selectedUsbId, links, folders]);

  const [confirmProjectorOpen, setConfirmProjectorOpen] = useState(false);
  const submit = useSubmit();

  const confirmAndSend = () => {
    if (!selectedUsbId) { 
      setConfirmProjectorOpen(false);
      return;
    }
    const fd = new FormData();
    fd.append("usb_id", selectedUsbId);
    submit(fd, { method: "post", action: "/actions/projector" });
    setConfirmProjectorOpen(false);
  };

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteUsbId, setDeleteUsbId] = useState<string | null>(null);

  const deleteUsb = useMemo(
    () => usbs.find((u: any) => u.id === deleteUsbId),
    [usbs, deleteUsbId]
  );

  const confirmDelete = () => {
    if (!deleteUsbId) { setConfirmDeleteOpen(false); return; }
    const fd = new FormData();
    fd.append("id", deleteUsbId);
    fd.append("_intent", "delete");
    submit(fd, { method: "post" });
    setConfirmDeleteOpen(false);
  };



  const [orderedState, setOrderedState] = useState<Array<{ id: string; title: string }>>([]);
  useEffect(() => {
    setOrderedState(linkedFoldersOrdered);
  }, [linkedFoldersOrdered]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 6 } })
  );

  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [overFolderId, setOverFolderId] = useState<string | null>(null);
  const [overFolderPos, setOverFolderPos] = useState<"left" | "right" | null>(null);

  const activeFolder =
    activeFolderId ? orderedState.find((f) => f.id === activeFolderId) || null : null;

  const onFoldersDragStart = useCallback((event: any) => {
    setActiveFolderId(event.active?.id ?? null);
  }, []);

  const onFoldersDragOver = useCallback((event: any) => {
    const { active, over } = event;
    if (!over) {
      setOverFolderId(null);
      setOverFolderPos(null);
      return;
    }

    const activeRect = active.rect.current.translated ?? active.rect.current.initial;
    const activeMiddleX = activeRect.left + activeRect.width / 2;

    const overRect = over.rect;
    const overMiddleX = overRect.left + overRect.width / 2;

    setOverFolderId(over.id);
    setOverFolderPos(activeMiddleX < overMiddleX ? "left" : "right");
  }, []);

  const onFoldersDragEnd = useCallback(async (event: any) => {
    setActiveFolderId(null);
    setOverFolderId(null);
    setOverFolderPos(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedState.findIndex((f) => f.id === active.id);
    const overIndex = orderedState.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || overIndex === -1) return;

    let targetIndex = overFolderPos === "right" ? overIndex + 1 : overIndex;

    if (oldIndex < targetIndex) targetIndex -= 1;

    const newOrder = arrayMove(orderedState, oldIndex, targetIndex);
    setOrderedState(newOrder);

    if (!selectedUsbId) return;

    try {
      await fetch("/api/update-folder-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usb_id: selectedUsbId,
          order: newOrder.map((f, i) => ({ folder_id: f.id, order_index: i })),
        }),
      });
    } catch {}
  }, [orderedState, selectedUsbId, overFolderPos]);

  const foldersNotLinkedToSelectedUsb = useMemo(() => {
    if (!selectedUsbId) return [];
    const linkedIds = new Set(
      links.filter((l: any) => l.usb_id === selectedUsbId).map((l: any) => l.folder_id)
    );
    return folders.filter((f: any) => !linkedIds.has(f.id));
  }, [selectedUsbId, folders, links]);

  return (
    <>
      <div>
        <h1>Dashboard</h1>
        <p className="desc">Welkom terug, {displayName}!</p>

        <div className="c-dashboard">
          <section>
            <div className="secondary-button">
              <h2>
                GoalCast USB sticks
                <span className="highlight">({usbs.length})</span>
              </h2>
              <button className="secondary-button__box" onClick={() => setShowModal(true)} data-tour="usb-toevoegen-dashboard">
                <i className="fa-regular fa-square-plus" ></i>
              </button>
              <div className="ml-5">
                {selectedUsbId && (
                  <button
                    type="button"
                    className="btn primary-button"
                    style={{ marginLeft: "2rem" }}
                    onClick={() => setConfirmProjectorOpen(true)}
                  >
                    Verstuur/update GoalCast
                  </button>
                )}
              </div>
            </div>

            <div className="row g-4 mt-3">
              {usbs.map((usb: any) => (
                <div
                  className="col-6 col-md-4"
                  key={usb.id}
                  onClick={() => setSelectedUsbId(usb.id)}
                >
                  <div className={`c-usb-card ${selectedUsbId === usb.id ? "selected" : ""}`}>
                    <img className="c-usb-card__logo" src={usb.logo_url} alt={usb.title} />
                    <div className="c-usb-card__info">
                      <h3>{usb.title}</h3>
                      <p className="c-usb-card__info--status">
                        <span className="d-none d-lg-block">{usb.code}</span>
                        <span className="dot mt-1"></span>
                        {usb.is_online ? (
                          <span className="online">Online</span>
                        ) : (
                          <span className="offline">Offline</span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="c-usb-card__button d-flex justify-content-center align-items-center"
                      onClick={(e) => {
                        e.stopPropagation();               
                        setDeleteUsbId(usb.id);
                        setConfirmDeleteOpen(true);
                      }}
                      onPointerDownCapture={(e) => e.stopPropagation()} 
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section data-tour="toegevoegde-mappen">
            <h2 className="mb-5">Toegevoegde mappen</h2>
            {selectedUsbId ? (
              orderedState.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={onFoldersDragStart}
                  onDragOver={onFoldersDragOver}
                  onDragEnd={onFoldersDragEnd}
                >
                  <SortableContext
                    items={orderedState.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="row g-4">
                      {orderedState.map((folder) => {
                        const beforePh =
                          overFolderId === folder.id &&
                          overFolderPos === "left" &&
                          activeFolderId !== folder.id;

                        const afterPh =
                          overFolderId === folder.id &&
                          overFolderPos === "right" &&
                          activeFolderId !== folder.id;

                        return (
                          <div key={folder.id} className="w-100 d-contents">
                            {beforePh && (
                              <div className="col-12">
                                <div className="drop-placeholder-folder" />
                              </div>
                            )}

                            <div className="col-12">
                              <SortableItemFolder
                                id={folder.id}
                                isActiveDragged={activeFolderId === folder.id}
                              >
                                <div className="c-folder-card">
                                  <img className="c-folder-card__img" src="/folder.svg" alt="folder-img" />
                                  <div className="c-folder-card__info">
                                    <h3>{folder.title}</h3>
                                    <p>{countsByFolder[folder.id] || 0} slides</p>
                                  </div>
                                </div>

                                <div className="d-flex justify-content-center">
                                  <Form
                                    method="post"
                                    onPointerDownCapture={(e) => e.stopPropagation()}
                                    onClickCapture={(e) => e.stopPropagation()}
                                    onMouseDownCapture={(e) => e.stopPropagation()}
                                    onTouchStartCapture={(e) => e.stopPropagation()}
                                  >
                                    <input type="hidden" name="folder_id" value={folder.id} />
                                    <input type="hidden" name="usb_id" value={selectedUsbId} />
                                    <button
                                      className="c-folder-card-button"
                                      type="submit"
                                      name="_intent"
                                      value="remove-folder"
                                      onPointerDownCapture={(e) => e.stopPropagation()}
                                      onClickCapture={(e) => e.stopPropagation()}
                                      onMouseDownCapture={(e) => e.stopPropagation()}
                                      onTouchStartCapture={(e) => e.stopPropagation()}
                                    >
                                      <i className="fa-solid fa-chevron-down"></i>
                                    </button>
                                  </Form>
                                </div>
                              </SortableItemFolder>
                            </div>

                            {afterPh && (
                              <div className="col-12">
                                <div className="drop-placeholder-folder" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </SortableContext>

                  <DragOverlay dropAnimation={{ duration: 150 }}>
                    {activeFolder ? (
                      <div className="drag-overlay">
                        <div className="c-folder-card">
                          <img className="c-folder-card__img" src="/folder.svg" alt="folder-img" />
                          <div className="c-folder-card__info">
                            <h3>{activeFolder.title}</h3>
                            <p>{countsByFolder[activeFolder.id] || 0} slides</p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              ) : (
                <div><em>Geen mappen gekoppeld aan deze USB.</em></div>
              )
            ) : (
              <p><em>Selecteer een USB-stick om gekoppelde mappen te zien.</em></p>
            )}
          </section>

          {/* Alle mappen */}
          <section data-tour="alle-mappen">
            <h2 className="mb-4">Alle mappen</h2>
            <div className="row">
              {folders.map((folder: any) => {
                const isLinked = selectedUsbId
                  ? links.some(
                      (link: any) =>
                        link.folder_id === folder.id &&
                        link.usb_id === selectedUsbId
                    )
                  : false;

                return (
                  <div className="col-6 pb-4 col-md-4" key={folder.id}>
                    <div className="c-folder-card">
                      <img className="c-folder-card__img" src="/folder.svg" alt="folder-img" />
                      <div className="c-folder-card__info">
                        <h3>{folder.title}</h3>
                        <p>{countsByFolder[folder.id] || 0} slides</p>
                      </div>
                    </div>
                    <div className="d-flex justify-content-center ">
                      {!isLinked && selectedUsbId && (
                        <Form method="post" style={{ display: "inline" }}>
                          <input type="hidden" name="folder_id" value={folder.id} />
                          <input type="hidden" name="usb_id" value={selectedUsbId} />
                          <button className="c-folder-card-button" type="submit" name="_intent" value="assign-folder">
                            <i className="fa-solid fa-chevron-up"></i>
                          </button>
                        </Form>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <Modal isOpen={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        {deleteUsb && (
            <h3>Ben je zeker dat je de USB-stick <strong style={{ color: "#DDA40B" }}>{deleteUsb.title}</strong> wil verwijderen?</h3>
        )}
        <div className="d-flex justify-content-end" style={{ gap: ".75rem", marginTop: "1rem" }}>
          <button className="btn btn-confirm" onClick={() => setConfirmDeleteOpen(false)}>Nee</button>
          <button className="btn primary-button btn-confirm" onClick={confirmDelete}>Ja, verwijderen</button>
        </div>
      </Modal>


      <Modal isOpen={confirmProjectorOpen} onClose={() => setConfirmProjectorOpen(false)}>
        <h3>Ben je zeker dat je wil versturen/updaten?</h3>
        <div className="d-flex justify-content-end" style={{ gap: ".75rem", marginTop: "1rem" }}>
          <button className="btn btn-confirm" onClick={() => setConfirmProjectorOpen(false)}>Nee</button>
          <button className="btn primary-button btn-confirm" onClick={confirmAndSend}>Ja</button>
        </div>
      </Modal>


      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h3>Nieuwe GoalCast USB toevoegen</h3>
        <UsbForm onSuccess={() => setShowModal(false)} />
      </Modal>
    </>
  );
}
