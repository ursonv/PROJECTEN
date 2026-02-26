import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultButtonStyles, defaultStyles } from "@styles/styles";
import { consume } from "@lit/context";
import { ActivityContext, activityContext } from "./ActivityDetailContainer";

import "@components/design/Typography/PageTitle";
import "@components/design/Button/PageTitleButton";
import { deleteActivity } from "@core/modules/activities/Activity.api";
import { Router } from "@vaadin/router";

@customElement("activity-detail")
class ActivityDetail extends LitElement {
  @consume({ context: activityContext, subscribe: true })
  @property({ attribute: false })
  public activityContextValue?: ActivityContext | null;

  handleDeleteClick = () => {
    const { activityContextValue } = this;

    if (activityContextValue && activityContextValue.activity) {
      const activityId = activityContextValue.activity._id;

      deleteActivity(activityId)
        .then(() => {
          Router.go("/activities");
          console.log("Activity deleted successfully");
        })
        .catch((error) => {
          console.error("Error deleting activity:", error);
        });
    }
  };

  render() {
    const { activityContextValue } = this;

    if (!activityContextValue || !activityContextValue.activity) {
      return html``;
    }

    const { activity } = activityContextValue;

    return html`
    <div class="title-and-link">
      <app-page-title>${activity.description}</app-page-title>
      <app-page-title-button href="/activities/${activity._id}/edit">Edit</app-page-title-button>
      <button @click=${this.handleDeleteClick}>Delete</button>
    </div>
    `;
  }

  static styles = [defaultStyles, defaultButtonStyles];
}

export default ActivityDetail;
