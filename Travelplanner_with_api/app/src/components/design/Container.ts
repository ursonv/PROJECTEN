import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("app-container")
export class Container extends LitElement {
  render() {
    return html`<div class="container"><slot></slot></div>`;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      padding: 0;
      margin: 0;
    }
    .container {
      display: block;
      padding: 2rem 1rem;
      width: 90%;
      max-width: 78rem;
      margin: 0 auto;
    }
  `;
}
