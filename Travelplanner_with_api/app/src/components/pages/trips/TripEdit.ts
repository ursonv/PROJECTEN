import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultStyles } from "@styles/styles";

import "@components/pages/trips/form/TripForm";
import "@components/design/Typography/PageTitle";
import { consume } from "@lit/context";
import { TripContext, tripContext } from "./TripDetailContainer";
import { TripBody } from "@core/modules/trips/Trip.types";
import { updateTrip } from "@core/modules/trips/Trip.api";


@customElement("trip-edit")
class TripEdit extends LitElement {
  @consume({ context: tripContext, subscribe: true })
  @property({ attribute: false })
  public tripContextValue?: TripContext | null;

  handleSuccess = () => {
    const { tripContextValue } = this;
    if (tripContextValue) {
        tripContextValue.refresh();
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

    return html` <app-page-title>Edit trip</app-page-title>
      <trip-form
        submitLabel="Edit"
        .onSuccess=${this.handleSuccess}
        .data=${trip}
        .method=${(body: TripBody) => updateTrip(trip._id, body)}
      ></trip-form>`;
  }

  static styles = [defaultStyles];
}

export default TripEdit;
