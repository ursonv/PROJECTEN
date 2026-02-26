import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";

type UsbActionResponse = {
  success?: boolean;
  error?: string;
};

export default function UsbForm({ onSuccess }: { onSuccess?: () => void }) {
  const fetcher = useFetcher();
  const result = fetcher.data as UsbActionResponse;

  useEffect(() => {
    if (fetcher.state === "idle" && result?.success) {
      onSuccess?.();
      window.location.href = "/";
    }
  }, [fetcher.state, result, onSuccess]);

  return (
    <fetcher.Form method="post" action="/actions/usb" encType="multipart/form-data" className="c-action-form">
      <div className="mb-3 c-action-form__section">
        <label htmlFor="title" className="form-label c-action-form__section--label">Titel</label>
        <input type="text" name="title" id="title" className="form-control c-action-form__section--input" required placeholder="Naam van de GoalCast USB" />
      </div>

      <div className="mb-3 c-action-form__section">
        <label htmlFor="code" className="form-label c-action-form__section--label">Unieke code</label>
        <input type="text" name="code" id="code" className="form-control c-action-form__section--input" required placeholder="xxxx-xxxx-xxxx-xxxx"/>
      </div>

      <div className="mb-5 c-action-form__section">
        <label htmlFor="logo" className="form-label c-action-form__section--label">Logo (optioneel)</label>
        <input type="file" name="logo" id="logo" accept="image/*" className="form-control c-action-form__section--input" />
      </div>

      <button type="submit" name="_intent" value="create" className="btn c-action-form__button">
        Toevoegen
      </button>
    </fetcher.Form>
  );
}
