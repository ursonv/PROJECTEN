import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";

type Props = {
  usbs: { id: string; title: string }[];
  onSuccess?: () => void;
};

type FolderActionResponse = {
  success?: boolean;
  error?: string;
};

export default function FolderForm({ usbs, onSuccess }: Props) {
  const fetcher = useFetcher();
  const result = fetcher.data as FolderActionResponse;

  useEffect(() => {
    if (fetcher.state === "idle" && result?.success && onSuccess) {
      onSuccess();
    }
  }, [fetcher.state, result, onSuccess]);

  return (
    <fetcher.Form method="post" action="/actions/folder" className="c-action-form">
      <div className="mb-5 c-action-form__section">
        <label className="form-label c-action-form__section--label">Titel</label>
        <input type="text" name="title" required className="form-control c-action-form__section--input" placeholder="Naam van de map"/>
      </div>
      <button
        type="submit"
        name="_intent"
        value="create"
        className="btn c-action-form__button"
      >
        Voeg map toe
      </button>
    </fetcher.Form>
  );
}
