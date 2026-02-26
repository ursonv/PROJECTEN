import { Link, useLoaderData } from "@remix-run/react";
import {
  data,
  redirect,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/node";
import { useState } from "react";
import { getSupabaseServerClient } from "~/utils/supabase.server";
import Modal from "~/components/popup/Modal";
import FolderForm from "~/components/forms/FolderForm";

type Usb = {
  id: string;
  title: string;
};

type Folder = {
  id: string;
  title: string;
  usb_id: string | null;
  user_id: string;
};

type Block = {
  id: string;
  folder_id: string | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const [{ data: usbs }, { data: folders }, { data: blocks }] = await Promise.all([
    supabase.from("usbs").select("id, title").eq("user_id", userData.user.id),
    supabase.from("folders")
      .select("id, title, usb_id, user_id")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false }),
    supabase.from("blocks").select("id, folder_id"),
  ]);

  const countsByFolder = (blocks as Block[] | null)?.reduce<Record<string, number>>((acc, block) => {
    if (block.folder_id) {
      acc[block.folder_id] = (acc[block.folder_id] || 0) + 1;
    }
    return acc;
  }, {}) ?? {};

  return data(
    { usbs: usbs || [], folders: folders || [], countsByFolder },
    { headers: response.headers }
  );
};

export const action: ActionFunction = async ({ request }) => {
  const response = new Response();
  const supabase = getSupabaseServerClient({ request, response });
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return redirect("/login");

  const form = await request.formData();
  const title = form.get("title") as string;
  const usb_id = form.get("usb_id") as string;

  if (!title) {
    return data({ error: "Titel is verplicht" }, { status: 400 });
  }

  await supabase.from("folders").insert({
    title,
    usb_id: usb_id || null,
    user_id: userData.user.id,
  });

  return data({ success: true }, { headers: response.headers });
};

export default function FoldersPage() {
  const { usbs, folders, countsByFolder } = useLoaderData<{
    usbs: Usb[];
    folders: Folder[];
    countsByFolder: Record<string, number>;
  }>();

  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div>
        <h1 data-tour="projecten-title">Projecten</h1>

        <div className="c-projects mt-4">
          <div className="secondary-button">
            <h2>Mappen</h2>
            <button className="secondary-button__box" onClick={() => setShowModal(true)} data-tour="projecten-button">
              <i className="fa-regular fa-square-plus"></i>
            </button>
          </div>
        </div>

        <div className="row mt-2">
          {folders.map((folder) => {
            const count = countsByFolder[folder.id] || 0;
            return (
              <div key={folder.id} className="col-6 col-md-4 pr-5 pb-4">
                <Link to={`/projecten/${folder.id}`}>
                  <div className="c-folder-card-projects">
                    <img className="c-folder-card__img" src="/folder-grey.png" alt="folder-img" />
                    <div className="c-folder-card__info">
                      <h3>{folder.title}</h3>
                      <p>{count} {count === 1 ? "slide" : "slides"}</p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h3>Nieuwe map toevoegen</h3>
        <FolderForm usbs={usbs} onSuccess={() => setShowModal(false)} />
      </Modal>
    </>
  );
}
