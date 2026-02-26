import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultButtonStyles, defaultStyles } from "@styles/styles";
import { consume } from "@lit/context";

import { TripContext, tripContext } from "../TripDetailContainer";

import "@components/design/Typography/PageTitle";
import "@components/design/Button/PageTitleButton";
import { deleteNote } from "@core/modules/notes/Note.api";
import { Router } from "@vaadin/router";

@customElement("trip-detail-notes")
class TripDetailNotes extends LitElement {
  @consume({ context: tripContext, subscribe: true })
  @property({ attribute: false })
  public tripContextValue?: TripContext | null;

  handleEditNoteClick = (noteId: string) => {
    Router.go(`/notes/${noteId}/edit`);
  };

   handleDeleteNoteClick = (noteId: string) => {
    const { tripContextValue } = this;

    if (tripContextValue && tripContextValue.trip) {
      deleteNote(noteId)
        .then(() => {
          console.log("Note deleted successfully");
          window.location.reload();
        })
        .catch((error) => {
          console.error("Error deleting note:", error);
        });
    }
  };

  render() {
    const { tripContextValue } = this;

    if (!tripContextValue || !tripContextValue.trip) {
      return html``;
    }

    const { trip } = tripContextValue;

    if (!trip) {
      return html``;
    }

    return html`
      <div class="trip-detail-container">
        <h3 class="trip-detail-container-title">Notes for ${trip.destination}</h3>
        <div class="c-cards-container">
          ${trip.notes.length > 0
            ? trip.notes.map(
                (note) => html`
                  <div class="c-card">
                    <div class="c-card__titlecontainer">
                      <h4 class="c-card__titlecontainer--title">${note.title}</h4>
                    </div>
                    
                    <div class="greenline"></div>
                    <div class="c-card__content">
                      ${note.content}
                    </div>
                    <div class="c-card__buttons">
                      <app-page-edit-button @click=${() => this.handleEditNoteClick(note._id)}>
                      </app-page-edit-button>
                      <app-page-delete-button @click=${() => this.handleDeleteNoteClick(note._id)}>
                        Delete Note
                      </app-page-delete-button>
                    </div>
                  </div>
                `
              )
            : html`<p class="trip-detail-notfound">No notes found</p>`}
        </div>
      </div>
    `;
  
  }

  static styles = [
    defaultStyles,
    defaultButtonStyles,
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
  
    @media (max-width: 768px) {
      .c-card {
        width: 100%; /* Full width on mobile */
      }
    }

    .c-card__titlecontainer {
      padding: .5rem;
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
    
    `,
  ];
}

export default TripDetailNotes;
