import { Link, Form } from "@remix-run/react";
import * as React from "react";
import Modal from "../popup/Modal";

type HandleProps = React.HTMLAttributes<HTMLElement>;

export default function BlockCard({
  block,
  handleProps = {},
}: {
  block: any;
  handleProps?: HandleProps; 
}) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const submitDelete = () => {
    if (!formRef.current) return;

    formRef.current.requestSubmit ? formRef.current.requestSubmit() : formRef.current.submit();
    setConfirmOpen(false);
  };
  return (
    <div className="c-block-card">
      <div className="c-block-card__img">
        <div
          className="c-block-card__overlay"
          {...handleProps}
          aria-label="Versleep"
          role="button"
        >
          <i className="fa-solid fa-up-down-left-right"></i>
        </div>

        {block?.blok?.image_url ? (
          <img
            src={`${block.blok.image_url}?t=${Date.now()}`}
            className="c-block-card__img--image"
            alt={block.title}
            draggable={false}
          />
        ) : (
          <img
            className="c-block-card__img--image"
            src="/default-usb-logo.png"
            alt={block.title}
            draggable={false}
          />
        )}
      </div>

      <div className="c-block-card__info d-flex">
        <div className="c-block-card__info--text">
          <h3>{block.title}</h3>
          <p>
            # {block.order_index}
            <span className="dot mt-1"></span>
            {block.updated_at &&
              new Date(block.updated_at).toLocaleDateString("nl-BE", {
                dateStyle: "medium",
              })}
          </p>
        </div>

        <div
          className="c-block-card__info--actions"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Link to={`/blok-bewerken/${block.id}`} className="me-2">
            <i className="fa-solid fa-pencil"></i>
          </Link>

          <Form
            ref={formRef}
            method="post"
            action={`/api/delete-block`}
            reloadDocument
          >
            <input type="hidden" name="blockId" value={block.id} />
            <button
              type="button"
              className="btn btn-link p-0"
              aria-label="Verwijder blok"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmOpen(true);
              }}
              onPointerDownCapture={(e) => e.stopPropagation()}
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          </Form>
        </div>
      </div>
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <h3>Ben je zeker dat je de slide <strong style={{ color: "#DDA40B" }}>{block.title}</strong> wil verwijderen?</h3>
        <div
          className="d-flex justify-content-end"
          style={{ gap: ".75rem", marginTop: "1rem" }}
        >
          <button className="btn btn-confirm" onClick={() => setConfirmOpen(false)}>
            Nee
          </button>
          <button className="btn primary-button btn-confirm" onClick={submitDelete}>
            Ja, verwijderen
          </button>
        </div>
      </Modal>
    </div>
  );
}
