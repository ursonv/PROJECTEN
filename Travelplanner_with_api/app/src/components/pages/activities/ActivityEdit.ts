import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { updateActivity } from "@core/modules/activities/Activity.api";
import { ActivityBody } from "@core/modules/activities/Activity.types";
import { defaultStyles } from "@styles/styles";
import { consume } from "@lit/context";
import { ActivityContext, activityContext } from "./ActivityDetailContainer";

import "@components/pages/activities/form/ActivityForm";
import "@components/design/Typography/PageTitle";


@customElement("activity-edit")
class ActivityEdit extends LitElement {
  @consume({ context: activityContext, subscribe: true })
  @property({ attribute: false })
  public activityContextValue?: ActivityContext | null;

  handleSuccess = () => {
    const { activityContextValue } = this;

    if (activityContextValue) {
      activityContextValue.refresh();
    }
  };

  render() {
    const { activityContextValue, handleSuccess } = this;

    if (!activityContextValue || !activityContextValue.activity) {
      return html``;
    }

    const { activity } = activityContextValue;

    return html` 
    <app-page-title>Edit activity</app-page-title>
      <activity-form
        submitLabel="Edit"
        .data=${activity}
        .onSuccess=${handleSuccess}
        .method=${(body: ActivityBody) => updateActivity(activity._id, body)}
      ></activity-form>`;
  }

  static styles = [defaultStyles];
}

export default ActivityEdit;
