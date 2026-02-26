import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultButtonStyles, defaultStyles } from "@styles/styles";
import { consume } from "@lit/context";
import { NoteContext, noteContext } from "./NoteDetailContainer";

import "@components/design/Typography/PageTitle";
import "@components/design/Button/PageTitleButton";
import { deleteNote } from "@core/modules/notes/Note.api";
import { Router } from "@vaadin/router";

@customElement("note-detail")
class NoteDetail extends LitElement {
  @consume({ context: noteContext, subscribe: true })
  @property({ attribute: false })
  public noteContextValue?: NoteContext | null;

  handleDeleteClick = () => {
    const { noteContextValue } = this;

    if (noteContextValue && noteContextValue.note) {
      const noteId = noteContextValue.note._id;

      deleteNote(noteId)
        .then(() => {
          Router.go("/notes");
          console.log("Note deleted successfully");
        })
        .catch((error) => {
          console.error("Error deleting note:", error);
        });
    }
  };

  render() {
    const { noteContextValue } = this;

    if (!noteContextValue || !noteContextValue.note) {
      return html``;
    }

    const { note } = noteContextValue;

    return html`
      <div class="title-and-link">
        <app-page-title>${note.title}</app-page-title>
        <app-page-title-button href="/notes/${note._id}/edit">Edit Note</app-page-title-button>
        <button @click=${this.handleDeleteClick}>Delete Note</button>
      </div>
    `;
  }

  static styles = [defaultStyles, defaultButtonStyles];
}

export default NoteDetail;
