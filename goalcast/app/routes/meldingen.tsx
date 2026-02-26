import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  data,
  redirect
} from "@remix-run/node";
import { useLoaderData, Form, Link, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import Modal from "~/components/popup/Modal";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Response("Niet ingelogd", { status: 401 });
  }

  const url = new URL(request.url);
  const pageParam = Number(url.searchParams.get("page")) || 1;
  const pageSizeParam = Number(url.searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE;
  const page = Math.max(1, pageParam);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSizeParam));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: settings, error: settingsError } = await supabase
    .from("settings")
    .select("notifications_enabled")
    .eq("user_id", user.id)
    .maybeSingle();

  if (settingsError) {
    console.error("Fout bij ophalen instellingen:", settingsError.message);
    throw new Response("Fout bij ophalen instellingen", { status: 500 });
  }

  if (!settings || !settings.notifications_enabled) {
    return data({
      notifications: [],
      notificationsEnabled: false,
      page,
      pageSize,
      total: 0,
      totalPages: 0,
      hasPrev: false,
      hasNext: false,
    });
  }

  const { data: notifications, error, count } = await supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("sent_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Fout bij ophalen meldingen:", error.message);
    throw new Response("Fout bij ophalen meldingen", { status: 500 });
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (total > 0 && page > totalPages) {
    const search = new URLSearchParams({ page: String(totalPages), pageSize: String(pageSize) }).toString();
    return redirect(`/meldingen?${search}`);
  }

  return data({
    notifications: notifications ?? [],
    notificationsEnabled: true,
    page,
    pageSize,
    total,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const notificationId = form.get("notificationId");

  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });
  

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Response("Niet ingelogd", { status: 401 });
  }

  if (typeof notificationId === "string") {
    await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", user.id);
  }

  const url = new URL(request.url);
  return redirect(`/meldingen${url.search}`);
}

export default function MeldingenPagina() {
  const {
    notifications,
    notificationsEnabled,
    page,
    pageSize,
    total,
    totalPages,
    hasPrev,
    hasNext,
  } = useLoaderData<typeof loader>();

  const submit = useSubmit();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<null | { id: string; message: string }>(null);

  function openDeleteConfirm(n: any) {
    setToDelete({ id: n.id, message: n.message });
    setConfirmOpen(true);
  }

  function confirmDelete() {
    if (!toDelete) return;
    const fd = new FormData();
    fd.append("notificationId", toDelete.id);
    submit(fd, { method: "post" }); 
    setConfirmOpen(false);
    setToDelete(null);
}

  return (
    <>
      <h1 data-tour="melding-title">Meldingen</h1>

      {!notificationsEnabled ? (
        <p className="mt-4">
          Pushmeldingen zijn uitgeschakeld in je instellingen.
        </p>
      ) : total === 0 ? (
        <p className="mt-4">Geen meldingen gevonden.</p>
      ) : (
        <>
        <div className="c-pager">
          <Form method="get" className="c-pager__pagesize">
            <input type="hidden" name="page" value={1} />
            <select
              id="pageSize"
              name="pageSize"
              defaultValue={pageSize}
              className="c-pager__select"
              onChange={(e) => e.currentTarget.form?.submit()}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <label htmlFor="pageSize" className="c-pager__label">Per pagina</label>
          </Form>

          <nav aria-label="Paginatie" className="c-pager__nav">
            <ul className="c-pager__list">
              <li className={`c-pager__item ${!hasPrev ? "c-pager__item--disabled" : ""}`}>
                {hasPrev ? (
                  <Link
                    className="c-pager__link"
                    to={`?page=${page - 1}&pageSize=${pageSize}`}
                    aria-label="Vorige pagina"
                    prefetch="intent"
                  >
                    &laquo; Vorige
                  </Link>
                ) : (
                  <span className="c-pager__link" aria-disabled="true">&laquo; Vorige</span>
                )}
              </li>

              <li className="c-pager__item">
                <span className="c-pager__count">{page} / {totalPages}</span>
              </li>

              <li className={`c-pager__item ${!hasNext ? "c-pager__item--disabled" : ""}`}>
                {hasNext ? (
                  <Link
                    className="c-pager__link"
                    to={`?page=${page + 1}&pageSize=${pageSize}`}
                    aria-label="Volgende pagina"
                    prefetch="intent"
                  >
                    Volgende &raquo;
                  </Link>
                ) : (
                  <span className="c-pager__link" aria-disabled="true">Volgende &raquo;</span>
                )}
              </li>
            </ul>
          </nav>
        </div>

          <ul className="d-flex flex-column gap-3 p-0 mt-4">
            {notifications.map((n) => {
              const isSuccess = n.status === "success";
              const iconClass = isSuccess
                ? "fa-circle-check text-success"
                : "fa-triangle-exclamation text-danger";
              const borderColor = isSuccess ? "border-success" : "border-danger";

              return (
                <li
                  key={n.id}
                  className={`rounded shadow-sm border-start border-5 ${borderColor} c-notification`}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-start gap-3 c-notification__left">
                      <i className={`fa-solid ${iconClass} mt-2`}></i>
                      <div>
                        <h3 className="c-notification__left--title">{n.message}</h3>
                      </div>
                    </div>
                    <div className="text-end d-flex flex-column align-items-end c-notification__right">
                      <span className="c-notification__right--title">
                        <div className="d-none d-lg-block">
                          <i className="fa-regular fa-clock me-1"></i>
                          {new Date(n.sent_at + "Z").toLocaleString("nl-NL", {
                            timeZone: "Europe/Amsterdam",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="d-lg-none">
                          {new Date(n.sent_at + "Z").toLocaleDateString("nl-NL", {
                            timeZone: "Europe/Amsterdam",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                      </span>

                      <button
                        type="button"
                        className="btn btn-link p-0 c-notification__btn"
                        title="Verwijder"
                        onClick={() => openDeleteConfirm(n)}
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>

                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <h3>Ben je zeker dat je deze melding wil verwijderen?</h3>
        <div className="d-flex justify-content-end" style={{ gap: ".75rem", marginTop: "1rem" }}>
          <button className="btn btn-confirm" onClick={() => setConfirmOpen(false)}>Nee</button>
          <button className="btn primary-button btn-confirm" onClick={confirmDelete}>Ja, verwijderen</button>
        </div>
      </Modal>

    </>
  );
}
