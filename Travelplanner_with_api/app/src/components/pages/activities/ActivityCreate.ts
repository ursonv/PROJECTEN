import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { defaultStyles } from "@styles/styles";
import { createActivity } from "@core/modules/activities/Activity.api";

import "@components/pages/activities/form/ActivityForm";
import "@components/design/Typography/PageTitle";

@customElement("activity-create")
class ActivityCreate extends LitElement {
  render() {
    return html` <app-page-title>Add activity</app-page-title>
      <activity-form .method=${createActivity}></activity-form>`;
  }

  static styles = [defaultStyles];
}

export default ActivityCreate;
