import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultButtonStyles, defaultStyles, formStyles } from "@styles/styles";
import { Router } from "@vaadin/router";
import { Note, NoteBody } from "@core/modules/notes/Note.types";
import { AxiosResponse } from "axios";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import { getTrips } from "@core/modules/trips/Trip.api";
import { Trip } from "@core/modules/trips/Trip.types";

@customElement("note-form")
class NoteForm extends LitElement {
  @property()
  isLoading: boolean = false;
  @property()
  error: string | null = null;
  @property()
  data: NoteBody = {
    title: "",
    content: "",
    tripId: "",
  };
  @property()
  trips: Array<Trip> | null = null;
  @property()
  submitLabel: String = "Add";
  @property()
  method: ((expense: NoteBody) => Promise<AxiosResponse<Note>>) | null = null;
  @property()
  onSuccess: (() => void) | null = null;

  // called when the element is first connected to the document’s DOM
  connectedCallback(): void {
    super.connectedCallback();
    this.fetchTrips();
  }

  fetchTrips() {
    getTrips()
      .then(({ data }) => {
        this.trips = data;
      })
      .catch((error) => {
        this.error = error;
      });
  }

  handleSubmit = (event: Event) => {
    if (!this.method) {
      return;
    }

    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const note = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      tripId: formData.get("tripId") as string,
    };

    this.isLoading = true;

    this.method(note)
      .then(() => {
        if (this.onSuccess) {
          this.onSuccess();
        }
        Router.go(`/notes/`);
      })
      .catch((error) => {
        this.isLoading = false;
        this.error = error.message;
      });
  };

  render() {
    const { isLoading, error, submitLabel, handleSubmit, data } = this;

    return html` ${error ? html`<error-view error=${error} />` : ""}
      <form @submit=${handleSubmit}>
        <div class="form-control">
          <label class="form-control__label" for="title">Note title</label>
          <input
            class="form-control__input"
            type="text"
            name="title"
            id="title"
            .value=${data.title}
            placeholder="Note title"
            ?disabled=${isLoading}
            required
          />
        </div>
        <div class="form-control">
          <label class="form-control__label" for="content">Note content</label>
          <textarea
            class="form-control__input"
            name="content"
            id="content"
            .value=${data.content}
            placeholder="Note content"
            ?disabled=${isLoading}
            rows="8"
            required
          ></textarea>
        </div>
        <div class="form-control">
          <label class="form-control__label" for="description">Trip</label>
          <select
            class="form-control__input"
            type="text"
            name="tripId"
            id="tripId"
            .value=${data.tripId}
            ?disabled=${isLoading}
            required
          >
            <option>--</option>
            ${this.trips?.map((c) => {
              return html`<option value=${c._id} .selected=${c._id === data.tripId}>${c.destination}</option>`;
            })}
          </select>
        </div>
        <button class="primary__button" type="submit" ?disabled=${isLoading}>${submitLabel}</button>
      </form>`;
  }

  static styles = [defaultStyles, formStyles, defaultButtonStyles, 
    css`
    form {
      margin-top: 2rem;
    }
  `];
}

export default NoteForm;
