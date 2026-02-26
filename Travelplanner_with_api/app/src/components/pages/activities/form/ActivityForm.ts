import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultButtonStyles, defaultStyles, formStyles } from "@styles/styles";
import { Router } from "@vaadin/router";
import { Activity, ActivityBody } from "@core/modules/activities/Activity.types";
import { AxiosResponse } from "axios";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import { getTrips } from "@core/modules/trips/Trip.api";
import { Trip } from "@core/modules/trips/Trip.types";
import formattedDate from "@core/utils/formattedDate";

@customElement("activity-form")
class ActivityForm extends LitElement {
  @property()
  isLoading: boolean = false;
  @property()
  error: string | null = null;
  @property()
  data: ActivityBody = {
    description: "",
    date: "",
    image: "",
    location: "",
    tripId: "",
  };
  @property()
  trips: Array<Trip> | null = null;
  @property()
  submitLabel: String = "Add";
  @property()
  method: ((activity: ActivityBody) => Promise<AxiosResponse<Activity>>) | null = null;
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
    if (!this.method || !this.trips) {
      return;
    }

    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const activity = {
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      image: formData.get("image") as string,
      location: formData.get("location") as string,
      tripId: formData.get("tripId") as string,
    };

    const selectedTrip = this.trips.find((trip) => trip._id === activity.tripId);

    if (!selectedTrip) {
      this.error = "Invalid trip selected.";
      return;
    }

    const activityDate = new Date(activity.date);
    const tripStartDate = new Date(selectedTrip.startDate);
    const tripEndDate = new Date(selectedTrip.endDate);

    if (activityDate < tripStartDate || activityDate > tripEndDate) {
      const formattedStartDate = tripStartDate.toLocaleDateString();
      const formattedEndDate = tripEndDate.toLocaleDateString();
      this.error = `Activity date must be within ${formattedStartDate} and ${formattedEndDate}.`;
      return;
    }
    

    this.isLoading = true;

    this.method(activity)
      .then(() => {
        if (this.onSuccess) {
          this.onSuccess();
        }
        Router.go(`/activities/`);
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
          <label class="form-control__label" for="description">Activity description</label>
          <input
            class="form-control__input"
            type="text"
            name="description"
            id="description"
            .value=${data.description}
            placeholder="Activity awesome"
            ?disabled=${isLoading}
            required
          />
        </div>
        <div class="form-control">
        <label class="form-control__label" for="name">Activity image</label>
        <input
          class="form-control__input"
          type="text"
          name="image"
          id="image"
          .value=${data.image}
          placeholder="Activity awesome"
          ?disabled=${isLoading}
          required
        />
      </div>
        <div class="form-control">
          <label class="form-control__label" for="name">Activity location</label>
          <input
            class="form-control__input"
            type="text"
            name="location"
            id="location"
            .value=${data.location}
            placeholder="Activity awesome"
            ?disabled=${isLoading}
            required
          />
        </div>
        <div class="form-control">
          <label class="form-control__label" for="name">Activity date</label>
          <input
            class="form-control__input"
            type="date"
            name="date"
            id="date"
            .value=${formattedDate(data.date)}
            placeholder="Activity awesome"
            ?disabled=${isLoading}
            required
          />
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

export default ActivityForm;
