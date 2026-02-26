import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getNoteById } from "@core/modules/notes/Note.api";
import { Note } from "@core/modules/notes/Note.types";
import { router } from "@core/router";
import { defaultStyles } from "@styles/styles";
import { createContext, provide } from "@lit/context";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";

export type NoteContext = {
  note: Note | null;
  refresh: () => void;
};

export const noteContext = createContext<NoteContext | null>("note");

@customElement("note-detail-container")
class NoteDetailContainer extends LitElement {
  @property()
  isLoading: boolean = false;
  @provide({ context: noteContext })
  noteContext: NoteContext | null = null;
  @property()
  error: string | null = null;

  @property({ type: Object }) location = router.location;

  // called when the element is first connected to the document’s DOM
  connectedCallback(): void {
    super.connectedCallback();
    this.noteContext = {
      note: null,
      refresh: this.fetchItem,
    };
    this.fetchItem();
  }

  // arrow function! otherwise "this" won't work in context provider
  fetchItem = () => {
    if (!this.location.params.id || typeof this.location.params.id !== "string") {
      return;
    }

    this.isLoading = true;
    getNoteById(this.location.params.id)
      .then(({ data }) => {
        this.noteContext = {
          note: data,
          refresh: this.fetchItem,
        };
        this.isLoading = false;
      })
      .catch((error) => {
        this.error = error.message;
        this.isLoading = false;
      });
  };

  render() {
    const { isLoading, noteContext, error } = this;

    if (!noteContext) {
      return html``;
    }

    const { note } = noteContext;

    if (error) {
      return html`<error-view error=${error} />`;
    }

    if (isLoading || !note) {
      return html`<loading-indicator></loading-indicator>`;
    }

    return html`<slot></slot>`;
  }

  static styles = [defaultStyles];
}

export default NoteDetailContainer;
