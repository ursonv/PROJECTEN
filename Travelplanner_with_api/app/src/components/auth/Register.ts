import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import { register } from "@core/modules/auth/Auth.api";
import { Router } from "@vaadin/router";

import "@components/design/ErrorView";
import { defaultStyles, formStyles } from "../../style/styles";

@customElement("register-page")
class Register extends LitElement {
  @property()
  isLoading: boolean = false;
  @property()
  error: string | null = null;

  handleSubmit(event: Event) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const avatar = formData.get("avatar") as string;
    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;

    this.isLoading = true;

    register({ email, password, first_name, last_name, avatar })
      .then(() => {
        this.isLoading = false;
        Router.go("/login");
      })
      .catch((error) => {
        this.isLoading = false;
        this.error = error.message;
      });
  }

  render() {
    const { isLoading, error, handleSubmit } = this;

    return html`
      <div class="register">
        <img src="/travel.png" alt="Travelplanner" class="register__logo">
        ${error ? html`<error-view error=${error}></error-view>` : ""}
        <form @submit=${handleSubmit} class="register__form form-control" id="register-form">
          <input type="text" name="first_name" class="register__input form-control__input" placeholder="First Name" />
          <input type="text" name="last_name" class="register__input form-control__input" placeholder="Last Name" />
          <input type="text" name="avatar" class="register__input form-control__input" placeholder="Avatar link (https://my-avatar.jpg)" />
          <input type="email" name="email" class="register__input form-control__input" placeholder="Email" />
          <input type="password" name="password" class="register__input form-control__input" placeholder="Password" />
          <button type="submit" class="register__button form-control__button" ?disabled=${isLoading}>Register</button>
          <p class="register__register">Do you already have an account? <a href="/login" class="register__register--link">Log in</a></p>
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

    .register {
      text-align: center;
      background-color: rgba(var(--secondary-rgb), 0.9);
      padding: 50px;
      width: 30%;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .register__logo {
      width: 150px;
      height: auto;
      margin-bottom: 20px;
    }

    .register__register {
      color: var(--black);
    }

    .register__register--link {
      text-decoration: underline;
      color: var(--green);
      font-weight: bold;
    }

    @media screen and (max-width: 600px) {
      .register {
        width: 90%; /* Aangepaste breedte op mobiel */
        margin: 40px; /* Marges toegevoegd op mobiel */
        padding: 20px;
      }

      .register__logo {
        width: 50%;
      }
    }

    @media screen and (max-width: 400px) {
      .register__register {
        font-size: 12px;
      }
    }
  `,
  ];  
}

export default Register;
