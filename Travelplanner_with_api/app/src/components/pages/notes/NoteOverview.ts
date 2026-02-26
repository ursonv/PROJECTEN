import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { deleteNote, getNotes } from "@core/modules/notes/Note.api";
import { Note } from "@core/modules/notes/Note.types";
import { defaultButtonStyles, defaultStyles } from "@styles/styles";

import "@components/design/Button/EditButton";
import "@components/design/Button/DeleteButton";
import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import "@components/design/Typography/PageTitle";
import "@components/design/Button/PageTitleButton";
import { Router } from "@vaadin/router";

@customElement("note-overview")
class NoteOverview extends LitElement {
  @property()
  isLoading: boolean = false;
  @property()
  notes: Array<Note> | null = null;
  @property()
  error: string | null = null;

  handleEditNoteClick = (noteId: string) => {
    Router.go(`/notes/${noteId}/edit`);
  };

  handleDeleteNoteClick = (noteId: string) => {
    deleteNote(noteId)
      .then(() => {
        console.log("Note deleted successfully");
        Router.go(`/notes/`);
      })
      .catch((error) => {
        console.error("Error deleting note:", error);
      });
  };

  // called when the element is first connected to the document’s DOM
  connectedCallback(): void {
    super.connectedCallback();
    this.fetchItems();
  }

  fetchItems() {
    this.isLoading = true;
    // todo in api
    getNotes()
      .then(({ data }) => {
        this.notes = data;
        this.isLoading = false;
      })
      .catch((error) => {
        this.error = error.message;
        this.isLoading = false;
      });
  }

  render() {
    const { isLoading, notes, error } = this;

    let content = html``;
    if (error) {
      content = html`<error-view error=${error} />`;
    } else if (isLoading || !notes) {
      content = html`<loading-indicator></loading-indicator>`;
    } else if (notes.length === 0) {
      content = html`<p>No notes yet...</p>`;
    } else {
      content = html` <div class="c-cards-container">
        ${notes.map((c) => {
          return html`
              <div class="c-card">
                <div class="c-card__badge">
                  <span>${c.trip?.destination}</span>
                </div>
                <div class="c-card__titlecontainer">
                  <h4 class="c-card__titlecontainer--title">${c.title}</h4>
                </div>
                
                <div class="greenline"></div>
                <div class="c-card__content">
                  ${c.content}
                </div>
                <div class="c-card__buttons">
                  <app-page-edit-button @click=${() => this.handleEditNoteClick(c._id)}>
                  </app-page-edit-button>
                  <app-page-delete-button @click=${() => this.handleDeleteNoteClick(c._id)}>
                  </app-page-delete-button>
                </div>
              </div>
          `;
        })}
      </div>`;
    }

    return html` 
      <div class="title-and-link">
        <app-page-title>Notes</app-page-title>
        <app-page-title-button href="/notes/create">Add note</app-page-title-button>
      </div>
      ${content}`;
  }

  static styles = [defaultStyles, defaultButtonStyles,
  css`
  .c-cards-container {
    display: flex;
    flex-wrap: wrap;
  }
  
  .c-card {
    background: var(--secondary);
    box-shadow: 6px 6px 5px gray;
    width: calc(33.33% - 10px); /* 3 cards per row with margin */
    margin-bottom: 20px;
    width: 350px;
    margin: 15px;
    padding: 5px;
    box-sizing: border-box;
    position: relative;
  }

  @media (max-width: 1000px) {
    .c-card {
      width: calc(50% - 10px); 
    }
  }

  @media (max-width: 768px) {
    .c-card {
      width: 100%; /* Full width on mobile */
    }
  }

  .c-card__badge {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background-color: var(--primary);
    color: var(--white);
    padding: 5px 0;
    text-align: center;
    z-index: 1;
  }

  .c-card__badge span {
    font-family: var(--font-mon);
  }

  .c-card__titlecontainer {
    padding: 2rem 0 .5rem;
    text-align: center;
  }

  .c-card__titlecontainer--title {
    font-family: var(--font-mon);
  }

  
  .c-card__content {
    padding: 1rem 2.5rem 3rem;
  }

  .c-card__buttons {
    position: absolute;
    bottom: 0;
    right: 0;
    padding-right: .5rem;
    padding-bottom: .5rem;
    display: flex;

  }
  
  .greenline {
    width: 100%;
    background-color: var(--primary);
    height: 2px;
  }
  `

  ];
}

export default NoteOverview;
