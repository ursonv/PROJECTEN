import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { updateNote } from "@core/modules/notes/Note.api";
import { NoteBody } from "@core/modules/notes/Note.types";
import { defaultStyles } from "@styles/styles";
import { consume } from "@lit/context";
import { NoteContext, noteContext } from "./NoteDetailContainer";

import "@components/pages/notes/form/NoteForm";
import "@components/design/Typography/PageTitle";

@customElement("note-edit")
class NoteEdit extends LitElement {
  @consume({ context: noteContext, subscribe: true })
  @property({ attribute: false })
  public noteContextValue?: NoteContext | null;

  handleSuccess = () => {
    const { noteContextValue } = this;

    if (noteContextValue) {
      noteContextValue.refresh();
    }
  };

  render() {
    const { noteContextValue, handleSuccess } = this;

    if (!noteContextValue || !noteContextValue.note) {
      return html``;
    }

    const { note } = noteContextValue;

    return html` <app-page-title>Edit note</app-page-title>
      <note-form
        submitLabel="Edit"
        .data=${note}
        .onSuccess=${handleSuccess}
        .method=${(body: NoteBody) => updateNote(note._id, body)}
      ></note-form>`;
  }

  static styles = [defaultStyles];
}

export default NoteEdit;
