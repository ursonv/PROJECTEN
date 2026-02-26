import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import { login } from "@core/modules/auth/Auth.api";
import * as Storage from "@core/storage";
import { Router } from "@vaadin/router";

import "@components/design/ErrorView";
import { defaultStyles, formStyles } from "../../style/styles";

@customElement("login-page")
class Login extends LitElement {
  @property()
  isLoading: boolean = false;
  @property()
  error: string | null = null;

  handleSubmit(event: Event) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    this.isLoading = true;

    login({ email, password })
      .then(({ data }) => {
        this.isLoading = false;
        Storage.saveAuthToken(data.token);
        Router.go("/");
      })
      .catch((error) => {
        this.isLoading = false;
        this.error = error.message;
      });
  }

  render() {
    const { isLoading, error, handleSubmit } = this;

    return html`
      <div class="login">
        <img src="/travel.png" alt="Travelplanner" class="login__logo">
        ${error ? html`<error-view error=${error}></error-view>` : ""}
        <form @submit=${handleSubmit} class="login__form form-control" id="login-form">
          <input type="email" name="email" class="login__input form-control__input" placeholder="Email" />
          <input type="password" name="password" class="login__input form-control__input" placeholder="Password" />
          <button type="submit" class="login__button form-control__button" ?disabled=${isLoading}>Login</button>
          <p class="login__register">No account yet? <a href="/register" class="login__register--link">Register here</a></p>
        </form>
      </div>
    `;
  }

  static styles = [
  defaultStyles,
  formStyles,
  css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-image: url('https://wallpapers.com/images/featured/travel-ibk7fgrvtvhs7qzg.jpg');
      //background-image: url('https://wallpapers.com/images/hd/travel-hd-axhrsecphqby11wk.jpg');
      background-size: cover;
      background-position: center;
      font-family: var(--font-sans);
    }

    .login {
      text-align: center;
      background-color: rgba(var(--secondary-rgb), 0.9);
      padding: 50px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .login__logo {
      width: 150px;
      height: auto;
      margin-bottom: 20px;
    }

    .login__register {
      color: var(--black);
    }

    .login__register--link {
      text-decoration: underline;
      color: var(--green);
      font-weight: bold;
    }

    @media screen and (max-width: 600px) {
      .login {
        width: 90%; /* Aangepaste breedte op mobiel */
        margin: 40px; /* Marges toegevoegd op mobiel */
        padding: 20px;
      }

      .login__logo {
        width: 50%;
      }
    }

    @media screen and (max-width: 400px) {
      .login__register {
        font-size: 12px;
      }
    }
  `,
  ];  
}

export default Login;
