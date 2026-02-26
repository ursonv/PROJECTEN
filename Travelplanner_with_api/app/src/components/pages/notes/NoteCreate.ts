import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { defaultStyles } from "@styles/styles";
import { createNote } from "@core/modules/notes/Note.api";

import "@components/pages/notes/form/NoteForm";
import "@components/design/Typography/PageTitle";

@customElement("note-create")
class NoteCreate extends LitElement {
  render() {
    return html` <app-page-title>Add note</app-page-title>
      <note-form .method=${createNote}></note-form>`;
  }

  static styles = [defaultStyles];
}

export default NoteCreate;
