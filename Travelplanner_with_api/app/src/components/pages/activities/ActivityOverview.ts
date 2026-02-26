import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { deleteActivity, getActivities } from "@core/modules/activities/Activity.api";
import { Activity } from "@core/modules/activities/Activity.types";
import { defaultButtonStyles, defaultStyles } from "@styles/styles";
import { format, parseISO } from "date-fns";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import "@components/design/Typography/PageTitle";
import "@components/design/Button/PageTitleButton";
import { Router } from "@vaadin/router";

@customElement("activity-overview")
class ActivityOverview extends LitElement {
  @property()
  isLoading: boolean = false;
  @property()
  activities: Array<Activity> | null = null;
  @property()
  error: string | null = null;

  handleDeleteActivityClick = (activityId: string) => {
    deleteActivity(activityId)
      .then(() => {
        console.log("Activity deleted successfully");
        Router.go(`/activities/`);
      })
      .catch((error) => {
        console.error("Error deleting activity:", error);
      });
  };

  // called when the element is first connected to the document’s DOM
  connectedCallback(): void {
    super.connectedCallback();
    this.fetchItems();
  }

  fetchItems() {
    this.isLoading = true;
    // todo in api
    getActivities()
      .then(({ data }) => {
        this.activities = data;
        this.isLoading = false;
      })
      .catch((error) => {
        this.error = error.message;
        this.isLoading = false;
      });
  }

  render() {
    const { isLoading, activities, error } = this;

    let content = html``;
    if (error) {
      content = html`<error-view error=${error} />`;
    } else if (isLoading || !activities) {
      content = html`<loading-indicator></loading-indicator>`;
    } else if (activities.length === 0) {
      content = html`<p>No activities yet</p>`;
    } else {
      content = html`<div class="c-activity-wrapper">
        ${activities.map((c) => {
           return html`
           <div class="c-activity-card">
              <div class="c-activity-card__badge">
                <span>Belongs to trip: <strong>${c.trip?.destination}</strong></span>
              </div>
              <div class="c-activity-card__img">
                <img src="${c.image}" alt="${c.description}">
                <h1>${c.description}</h1>
              </div>
              <div class="c-activity-card__details">
                <span>
                <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                  width="16px" height="16px" viewBox="0 0 395.71 395.71"
                  xml:space="preserve">
                  <g>
                    <path d="M197.849,0C122.131,0,60.531,61.609,60.531,137.329c0,72.887,124.591,243.177,129.896,250.388l4.951,6.738
                      c0.579,0.792,1.501,1.255,2.471,1.255c0.985,0,1.901-0.463,2.486-1.255l4.948-6.738c5.308-7.211,129.896-177.501,129.896-250.388
                      C335.179,61.609,273.569,0,197.849,0z M197.849,88.138c27.13,0,49.191,22.062,49.191,49.191c0,27.115-22.062,49.191-49.191,49.191
                      c-27.114,0-49.191-22.076-49.191-49.191C148.658,110.2,170.734,88.138,197.849,88.138z"/>
                  </g>
                </svg>
                ${c.location}</span>
                <span>
                <svg fill="#000000" width="16px" height="16px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6,22H18a3,3,0,0,0,3-3V7a2,2,0,0,0-2-2H17V3a1,1,0,0,0-2,0V5H9V3A1,1,0,0,0,7,3V5H5A2,2,0,0,0,3,7V19A3,3,0,0,0,6,22ZM5,12.5a.5.5,0,0,1,.5-.5h13a.5.5,0,0,1,.5.5V19a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1Z"/>
                </svg>
                ${format(parseISO(c.date), "dd-MM-yyyy")}</span>
              </div>
              <div class="c-activity-card__buttons">
                <a href="/activities/${c._id}/edit">Edit</a>
                <button @click=${() => this.handleDeleteActivityClick(c._id)}>Delete</button>
              </div>
            </div>
           `;
        })}
      </div>`;
    }

    return html` 
      <div class="title-and-link">
        <app-page-title>Activities</app-page-title>
        <app-page-title-button href="/activities/create">Add activity</app-page-title-button>
      </div>
        ${content}`;
  }

  static styles = [defaultStyles, defaultButtonStyles, 
    css`
      .c-activity-wrapper {
        padding: 10px;
        display: flex;
        flex-wrap: wrap;
      }
      
      .c-activity-card {
        transition: 0.3s;
        width: 350px;
        margin: 15px;
        background: var(--white);
        border: 1px solid var(--primary);
        text-align: center;
        }

        @media (max-width: 1000px) {
          .c-activity-wrapper {
            padding: 0;
          }

          .c-activity-card {
            width: 275px;
          }
        }
      
        .c-activity-card__img {
          position: relative;
          text-align: center;
          background: var(--primary);
          img {
            transition: 0.3s;
            height: 300px;
            width: 100%;
            object-fit: cover;
            border-bottom: 4px solid var(--primary);
          }

          h1 {
            position: absolute;
            font-family: var(--font-mon);
            margin: 0;
            font-size: 1rem;
            bottom: 1rem;
            width: 100%;
            color: var(--white);
            background-color: rgba(0, 0, 0, 0.5); 
            width: 100%;
            padding: 1rem 0;
          }
        }
      
        .c-activity-card__details {
          margin-top: 30px;
          font-family: var(--font-sans);
          padding: 0 1rem;
          color: var(--black);
          span {
            padding: 0 5px;
          }
        }
      
        .c-activity-card__buttons {
          margin-top: 15px;
      
          button, a {
            background: var(--black);
            color: var(--white);

            margin: .5rem;
            border: none;
            cursor: pointer;
            &:hover {
              background: var(--primary);
            }
          }

          button {
            padding: 8px 15px;
          }

          a {
            padding: 4px 20px 7px;
          }
        }

        .c-activity-card__badge {
          background: var(--primary);
          color: var(--white);
          padding: 10px;
          text-align: center;

          strong {
            font-family: var(--font-mon);
            color: var(--black);
          }
        }
        
      }
    `
  ];
}

export default ActivityOverview;
