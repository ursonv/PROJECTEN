import { logout } from "@components/auth/AuthContainer";
import { User } from "@core/modules/auth/Auth.types";
import { consume } from "@lit/context";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultStyles } from "@styles/styles";
import userContext from "@components/auth/userContext";
import { router } from "@core/router";

import "@components/design/Logo/Logo";

@customElement("app-navigation")
class Navigation extends LitElement {
  @consume({ context: userContext, subscribe: true })
  @property({ attribute: false })
  public user?: User | null;

  @property({ type: Object }) location = router.location;

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("vaadin-router-location-changed", this.handleRouteChange);
  }

  handleRouteChange = () => {
    // location update to trigger re-render
    this.location = router.location;
  };

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("vaadin-router-location-changed", this.handleRouteChange);
  }

  handleLogout = () => {
    logout();
  };

  render() {
    const { location } = this;
    const { pathname } = location;

    return html`
      <aside class="c-dashboard__side c-nav">
        <a class="c-nav__logo" href="/"><app-logo /></a>
      
        <div class="c-nav__content">
          <ul class="c-nav__pages">
            <a class="c-nav__link" href="/trips"><li class="c-nav__page ${pathname.includes("trips") ? "c-nav__page--active" : ""} ">Trips</li></a>
            <a class="c-nav__link" href="/activities"><li class="c-nav__page ${pathname.includes("activities") ? "c-nav__page--active" : ""}">> Activities</li></a>
            <a class="c-nav__link" href="/expenses"><li class="c-nav__page ${pathname.includes("expenses") ? "c-nav__page--active" : ""}">> Expenses</li></a>
            <a class="c-nav__link" href="/notes"><li class="c-nav__page ${pathname.includes("notes") ? "c-nav__page--active" : ""}">> Notes</li></a>
          </ul>
        </div>

        <div class="c-nav__footer">
          <div class="c-nav__user">
            <img src="${this.user?.avatar}" alt="User Avatar" class="c-nav__avatar" height="40" width="40" />
            <p class="c-nav__welcome">Welkom, ${this.user?.first_name}!</p>
          </div>

          <button @click=${this.handleLogout} class="c-nav__logout">Logout</button>
        </div>
      </aside>
    `;
  }

  static styles = [
    defaultStyles,
    css`
      .c-dashboard__side {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100vh; 
        width: 18rem;
        position: fixed;
        top: 0;
        bottom: 0;
        overflow-y: auto;
        background-color: var(--background);
        color: #f2fcf8;
      }

      .c-nav__logo {
        align-self: center;
      }

      .c-nav__content {
        flex-grow: 1; 
        padding-top: 1rem; 
        padding-bottom: 3rem; 
        overflow-y: auto; 
      }

      .c-nav__footer {
        flex-shrink: 0; 
        padding: 1rem;
        border-top: 1px solid #f2fcf8;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      .c-nav__user {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
      }

      .c-nav__avatar {
        border-radius: 50%;
        margin-right: 1rem;
      }

      .c-nav__welcome {
        color: #f2fcf8;
        font-size: 1rem;
        margin: 0;
      }

      .c-nav__logout {
        width: 100%;
        padding: 1rem;
        border: none;
        background-color: #69d6a1;
        color: #f2fcf8;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
        border-radius: 5px;
      }

      .c-nav__logout:hover {
        background-color: #f2fcf8;
        color: #46d38f;
        cursor: pointer;
      }

      .c-nav__link {
        cursor: pointer;
        color: #f2fcf8;
        text-decoration: none;
      }

      .c-nav__pages {
        padding-left: 1rem;
        margin: 0;
        list-style: none;
        font-size: 1.5rem;
      }

      .c-nav__page {
        display: flex;
        align-items: center;
        height: 3rem;
        padding-left: 1rem;
        text-transform: uppercase;
        color: #f2fcf8;
        border-radius: 2rem 0 0 2rem;
        margin-bottom: 0.25rem;
      }

      .c-nav__page:hover {
        background-color: #69d6a1;
        color: #f2fcf8;
      }

      .c-nav__page--active {
        background-color: #f2fcf8;
        color: #46d38f;
        border-radius: 2rem 0 0 2rem;
      }

      @media only screen and (max-width: 767px) {
        .c-dashboard__side {
          width: 100%;
          height: auto;
          position: static;
        }
  
        .c-nav__content {
          padding-top: 1rem;
          padding-bottom: 1rem;
          overflow-y: auto;

        }
  
        .c-nav__footer {
          padding: 1rem;
        }
      }
    `,
  ];  
}

export default Navigation;
