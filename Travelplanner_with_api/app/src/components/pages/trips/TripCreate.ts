import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import "@components/pages/trips/form/TripForm";
import "@components/design/Typography/PageTitle";
import { createTrip } from "@core/modules/trips/Trip.api";

@customElement("trip-create")
class TripCreate extends LitElement {
  render() {
    return html`<app-page-title>Add trip</app-page-title>
      <trip-form .method=${createTrip}></trip-form> `;
  }
}

export default TripCreate;
