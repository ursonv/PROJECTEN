import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultButtonStyles, defaultStyles } from "@styles/styles";
import { consume } from "@lit/context";
import { TripContext, tripContext } from "./TripDetailContainer";
import "@components/design/Typography/PageTitle";
import "@components/design/Button/EditaButton";
import "@components/design/Button/EditButton";
import "@components/design/Button/DeleteButton";
import "@components/pages/trips/section/TripDetailActivities";
import "@components/pages/trips/section/TripDetailExpenses";
import "@components/pages/trips/section/TripDetailNotes";
import { deleteTrip } from "@core/modules/trips/Trip.api";
import { Router } from "@vaadin/router";
import { countdownDate } from "@core/utils/countdownDate";

@customElement("trip-detail")
class TripDetail extends LitElement {
  private countdownInterval?: NodeJS.Timeout;

  @consume({ context: tripContext, subscribe: true })
  @property({ attribute: false })
  public tripContextValue?: TripContext | null;

  handleDeleteTripClick = (tripId: string) => {
    deleteTrip(tripId)
      .then(() => {
        Router.go(`/trips/`);
        console.log("Trip deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting trip:", error);
      });
  };

  connectedCallback() {
    super.connectedCallback();
    this.countdownInterval = setInterval(this.updateCountdown, 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  updateCountdown = () => {
    const { tripContextValue } = this;

    if (tripContextValue && tripContextValue.trip) {
      const { startDate } = tripContextValue.trip;
      const countdown = countdownDate(startDate);
      const countdownElement = this.shadowRoot?.querySelector(".c-tripdetail__countdate");

      if (countdownElement) {
        countdownElement.innerHTML = `${countdown}`;
      }
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
      <div class="title-and-link-detail">
        <app-page-title>${trip.destination}</app-page-title>
        <app-page-edit-a-button href="/trips/${trip._id}/edit"></app-page-edit-a-button>
        <app-page-delete-button @click=${() => this.handleDeleteTripClick(trip._id)}>/app-page-delete-button>
      </div>
      <div class="c-tripdetail">
        <div class="c-tripdetail__img">
          <img src="${trip.img}" alt="${trip.destination}">
          <div class="overlay"></div>
          <div class="c-tripdetail__countdate">
          </div>
        </div>
        
        <trip-detail-activities></trip-detail-activities>
        <trip-detail-expenses></trip-detail-expenses>
        <trip-detail-notes></trip-detail-notes>
      </div>
    `;
  }

  static styles = [defaultStyles, defaultButtonStyles, 
    css`
    .title-and-link-detail {
        display: flex;
        align-items: center;
        margin-bottom: 0rem;
        padding: 1rem;
    }

    .c-tripdetail {
      display: flex;
      flex-direction: column;
    }

    .c-tripdetail__img {
      position: relative;
      flex: 1; 
      overflow: hidden;
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.3); 
    }

    .c-tripdetail__img img {
      width: 100%;
      height: 400px;
      object-fit: cover;
    }

    .c-tripdetail__countdate {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(0, 0, 0, 0.8); 
      padding: 2rem 4rem;
      text-transform: uppercase;
      text-align: center;
      color: var(--white);
      display: flex;
    }
    
    .c-tripdetail__countdate--center {
      margin-right: 1rem;
    }

    .c-tripdetail__countdate--centerlast {
      margin-right: 0;
    }

    .c-tripdetail__countdate--number {
      font-size: 2rem;
    }

    .c-tripdetail__countdate--seconds {
      color: var(--primary);
    }
    `];
}

export default TripDetail;
