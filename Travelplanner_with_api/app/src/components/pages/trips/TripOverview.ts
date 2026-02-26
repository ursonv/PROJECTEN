import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getTrips } from "@core/modules/trips/Trip.api";
import { Trip } from "@core/modules/trips/Trip.types";
import { format, parseISO } from "date-fns";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import "@components/design/Typography/PageTitle";
import "@components/design/Button/PageTitleButton";
import { defaultButtonStyles, defaultStyles } from "@styles/styles";

@customElement("trip-overview")
class TripOverview extends LitElement {
  @property()
  isLoading: boolean = false;
  @property()
  trips: Array<Trip> | null = null;
  @property()
  error: string | null = null;

  // called when the element is first connected to the document’s DOM
  connectedCallback(): void {
    super.connectedCallback();
    this.fetchItems();
  }

  fetchItems() {
    this.isLoading = true;
    // todo in api
    getTrips()
      .then(({ data }) => {
        this.trips = data;
        this.isLoading = false;
      })
      .catch((error) => {
        this.error = error.message;
        this.isLoading = false;
      });
  }

  render() {
    const { isLoading, trips, error } = this;

    let content = html``;
    if (error) {
      content = html`<error-view error=${error} />`;
    } else if (isLoading || !trips) {
      content = html`<loading-indicator></loading-indicator>`;
    } else if (trips.length === 0) {
      content = html`<p>No trips yet...</p>`;
    } else {
      content = html` <section class="c-archive">
        ${trips.map((c) => {
          const activityCount = c.activities ? c.activities.length : 0;
          const noteCount = c.notes ? c.notes.length : 0;
          return html`<a href="/trips/${c._id}">
          <article class="c-trip c-trip--starter">
            <img src="${c.img}" alt="" class="c-trip__plate" height="210" />
            <section class="c-trip__content">
              <h1 class="c-trip__name">
                ${c.destination}
                <div class="c-trip__status">${c.status}</div>
              </h1>
              <div class="c-trip__date">
              ${format(parseISO(c.startDate), "dd-MM-yyyy")} ->
              ${format(parseISO(c.endDate), "dd-MM-yyyy")}
              </div>
              <div class="c-svg">
                <img
                  src="../../../activities.svg"
                  alt="activities"
                  class="c-svg__activities"
                  height="25"
                />
                <span class="c-svg__activities--count"
                  >${activityCount}</span
                >
                <img
                  src="../../../notes.svg"
                  alt="notes"
                  class="c-svg__notes"
                  height="25"
                />
                <span class="c-svg__notes--count"
                  >${noteCount}</span
                >
              </div>
            </section>
          </article>
        </a>`;
        })}
      </section>`;
    }

    return html` 
      <div class="title-and-link">
        <app-page-title>Trips</app-page-title>
        <app-page-title-button href="/trips/create">Add trip</app-page-title-button>
      </div>
      ${content}`;
  }



  static styles = [
    defaultStyles,
    defaultButtonStyles,
    css`
      
      .c-archive {
        display: flex;
        flex-wrap: wrap;
        margin: -1rem; 
      }
      
      .c-trip {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: stretch;
        box-sizing: border-box;
        width: 20rem;
        max-width: calc(100% - 2rem); /* Adjust card width to fit within the container */
        height: 20.5rem;
        margin: 1rem;
        padding: 1rem;
        background-color: var(--secondary);
        border-radius: 1rem;
      }
      
      .c-trip--maincourse {
        background-color: red;
      }
      
      .c-trip--maincourse .c-trip__status {
        color: var(--green);
      }
      
      .c-trip--starter {
        background-color: var(--secondary);
      }
      
      .c-trip__header {
        display: flex;
      }
      
      .c-trip__plate {
        width: 100%;
        align-self: center;
        border-radius: 1rem 1rem 0 0;
      }
      
      .c-trip__name {
        display: flex;
        align-items: baseline;
        font-size: 1.5rem;
        margin: 0;
        padding: 1rem 0 0.2rem;
        text-transform: capitalize;
        font-family: var(--font-mon);
      }
      
      .c-trip__status {
        display: flex;
        align-items: center;
        background-color: #fff;
        height: 1.5rem;
        border-radius: 0.75rem;
        padding: 0 0.5rem;
        margin: 0 0 0.5rem 0.5rem;
        color: var(--green);
        font-weight: bold;
        font-size: 1rem;
      }
      
      .c-trip__date {
        font-size: 0.9rem;
      }
      
      .c-svg {
        display: flex;
        align-items: end;
        justify-content: flex-end;
        padding: 0;
        margin-top: -1rem;
      }
      
      .c-svg__activities,
      .c-svg__notes {
        margin-right: 0.2rem;
      }
      
      .c-svg__activities--count,
      .c-svg__notes--count {
        font-size: 0.8rem;
        color: var(--green);
      }
      
      .c-svg__activities--count {
        margin-right: 0.5rem;
      }
    `,
  ];  
}

export default TripOverview;
