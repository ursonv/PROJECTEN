import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getActivityById } from "@core/modules/activities/Activity.api";
import { Activity } from "@core/modules/activities/Activity.types";
import { router } from "@core/router";
import { defaultStyles } from "@styles/styles";
import { createContext, provide } from "@lit/context";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";

export type ActivityContext = {
  activity: Activity | null;
  refresh: () => void;
};

export const activityContext = createContext<ActivityContext | null>("activity");

@customElement("activity-detail-container")
class ActivityDetailContainer extends LitElement {
  @property()
  isLoading: boolean = false;
  @provide({ context: activityContext })
  activityContext: ActivityContext | null = null;
  @property()
  error: string | null = null;

  @property({ type: Object }) location = router.location;

  // called when the element is first connected to the document’s DOM
  connectedCallback(): void {
    super.connectedCallback();
    this.activityContext = {
      activity: null,
      refresh: this.fetchItem,
    };
    this.fetchItem();
  }

  // arrow function! otherwise "this" won't work in context provider
  fetchItem = () => {
    if (!this.location.params.id || typeof this.location.params.id !== "string") {
      return;
    }

    this.isLoading = true;
    getActivityById(this.location.params.id)
      .then(({ data }) => {
        this.activityContext = {
          activity: data,
          refresh: this.fetchItem,
        };
        this.isLoading = false;
      })
      .catch((error) => {
        this.error = error.message;
        this.isLoading = false;
      });
  };

  render() {
    const { isLoading, activityContext, error } = this;

    if (!activityContext) {
      return html``;
    }

    const { activity } = activityContext;

    if (error) {
      return html`<error-view error=${error} />`;
    }

    if (isLoading || !activity) {
      return html`<loading-indicator></loading-indicator>`;
    }

    return html`<slot></slot>`;
  }

  static styles = [defaultStyles];
}

export default ActivityDetailContainer;
