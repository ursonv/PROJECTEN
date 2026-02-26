import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { defaultStyles } from "@styles/styles";

@customElement("app-logo")
class Logo extends LitElement {
  render() {
    return html`<img src="/travel.png" alt="TravelplannerLogo" class="c-logo"/>`;
  }

  static styles = [
    defaultStyles,
    css`
      .c-logo {
        align-self: center;
        margin: 1.5rem 1rem 1.5rem .5rem;
        height: 150px;
        width: 150px;
      }
      
    `,
  ];
}

export default Logo;
