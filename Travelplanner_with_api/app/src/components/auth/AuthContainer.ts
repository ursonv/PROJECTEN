import { User } from "@core/modules/auth/Auth.types";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import * as Storage from "../../core/storage";
import { getCurrentUser } from "@core/modules/auth/Auth.api";
import { API } from "@core/network/api";
import { AxiosError, AxiosResponse } from "axios";
import { Router } from "@vaadin/router";
import { defaultStyles } from "@styles/styles";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import { provide } from "@lit/context";
import userContext from "./userContext";

export const logout = () => {
  Storage.saveAuthToken(null);
  Router.go("/login");
};

@customElement("auth-container")
class AuthContainer extends LitElement {
  @provide({ context: userContext })
  user: User | null = null;
  @property()
  isLoading: boolean = false;
  @property()
  error: string | null = null;

  connectedCallback(): void {
    super.connectedCallback();

    API.interceptors.request.use((config) => {
      const token = Storage.getAuthToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    });

    API.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.user = null;
          logout();
        }
        return Promise.reject(error);
      }
    );

    // fetch user
    this.isLoading = true;
    getCurrentUser()
      .then(({ data }) => {
        this.user = data;
      })
      .catch((error) => {
        this.error = error.message;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  render() {
    const { isLoading, error, user } = this;

    if (error) {
      return html`<error-view error=${error} />`;
    }

    if (isLoading || !user) {
      return html`<loading-indicator></loading-indicator>`;
    }

    return html`
      <app-navigation></app-navigation>
      <app-container>
        <slot></slot>
      </app-container>
    `;
  }

  static styles = [
    defaultStyles,
    css`

    @media screen and (min-width: 769px) {
      :host {
        display: grid;
        height: 100vh;
        grid-template-columns: 18rem auto; /* Aangepast naar 18rem voor de zijbalk */
      }
    }
    @media screen and (max-width: 768px) {
      :host {
        display: grid;
        height: 100vh;
      }
    }
    `,
  ];  
}

export default AuthContainer;
