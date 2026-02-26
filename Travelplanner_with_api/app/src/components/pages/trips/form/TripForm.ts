import { Trip, TripBody } from "@core/modules/trips/Trip.types";
import { defaultButtonStyles, defaultStyles, formStyles } from "@styles/styles";
import { Router } from "@vaadin/router";
import { AxiosResponse } from "axios";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import formattedDate from "@core/utils/formattedDate";

@customElement("trip-form")
class TripForm extends LitElement {
  @property()
  isLoading: boolean = false;
  @property()
  error: string | null = null;
  @property()
  submitLabel: string = "Add trip";
  @property()
  method: ((trip: TripBody) => Promise<AxiosResponse<Trip>>) | null = null;
  @property()
  onSuccess: (() => void) | null = null;
  @property()
  data: TripBody = {
    destination: "",
    img: "",
    startDate: new Date().toISOString().split('T')[0], //startDate ingesteld op vandaag, bij het creëren van een trip
    endDate: "",
    status: "",
    activities: [], 
    expenses: [],
    notes: [],
  };

  @property({ type: String })
  sevenDaysLater: string = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  constructor() {
    super();
    this.data.endDate = this.sevenDaysLater;
  }
 
  handleSubmit = (event: Event) => {
    event.preventDefault();

    if (!this.method) {
      return;
    }

    const formData = new FormData(event.target as HTMLFormElement);
    const trip = {
      destination: formData.get("destination") as string,
      img: formData.get("img") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      status: formData.get("status") as string,
      activities: this.data.activities,
      expenses: this.data.expenses,
      notes: this.data.notes,
    };

    if (new Date(trip.endDate) <= new Date(trip.startDate)) {
      this.error = "End date must be after start date";
      return;
    }

    this.isLoading = true;
    this.method(trip)
      .then(({ data }) => {
        if (this.onSuccess) {
          this.onSuccess();
        }
        Router.go(`/trips/${data._id}`);
      })
      .catch((error) => {
        this.error = error;
      });
  };


  render() {
    const { isLoading, handleSubmit, data, submitLabel, error } = this;

    return html`
      ${error ? html`<error-view error=${error} />` : ""}
      <form @submit=${handleSubmit}>
        <div class="form-control">
          <label class="form-control__label" for="destination">Trip destination</label>
          <input
            class="form-control__input"
            type="text"
            name="destination"
            id="destination"
            .value=${data.destination}
            placeholder=""
            ?disabled=${isLoading}
            required
          />
        </div>
        <div class="form-control">
            <label class="form-control__label" for="img">Trip img</label>
            <input
            class="form-control__input"
            type="text"
            name="img"
            id="img"
            .value=${data.img}
            placeholder=""
            ?disabled=${isLoading}
            required
            />
        </div>
        <div class="form-datecontrols">
          <div class="form-control">
              <label class="form-control__label" for="startDate">Trip startDate</label>
              <input
              class="form-control__input"
              type="date"
              name="startDate"
              id="startDate"
              .value=${formattedDate(data.startDate)}
              placeholder=""
              ?disabled=${isLoading}
              required
              />
          </div>
          <div class="form-control">
              <label class="form-control__label" for="endDate">Trip endDate</label>
              <input
              class="form-control__input"
              type="date"
              name="endDate"
              id="endDate"
              .value=${formattedDate(data.endDate)}
              placeholder=""
              ?disabled=${isLoading}
              required
              />
          </div>
        </div>
        <div class="form-control">
            <label class="form-control__label" for="status">Trip status</label>
            <select
                class="form-control__input"
                name="status"
                id="status"
                ?disabled=${isLoading}
                required
            >
                <option value="planned" ?selected=${data.status === "planned"}>Planned</option>
                <option value="ongoing" ?selected=${data.status === "ongoing"}>Ongoing</option>
                <option value="completed" ?selected=${data.status === "completed"}>Completed</option>
            </select>
        </div>
            
        <button class="primary__button" type="submit" ?disabled=${isLoading}>${submitLabel}</button>
      </form>
    `;
  }

  static styles = [defaultStyles, formStyles, defaultButtonStyles,
    css`
    form {
      margin-top: 2rem;
    }
    .form-datecontrols {
        display: flex;
        gap: 20px;
        align-items: center;
    }

    .form-datecontrols .form-control {
      flex: 1; 
      max-width: 50%; 
    }
  `
  ];
}

export default TripForm;
