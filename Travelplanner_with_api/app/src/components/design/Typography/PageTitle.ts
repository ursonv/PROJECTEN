import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { defaultStyles } from "@styles/styles";

@customElement("app-page-title")
class PageTitle extends LitElement {
  render() {
    return html`<h1><slot></slot></h1>`;
  }

  static styles = [
    defaultStyles,
    css`
      h1 {
        margin: 0;
        font-family: var(--font-mon);
        font-size: 2rem;
        font-weight: bolder;
        color: var(--green);
        margin-right: 2rem; 
      }
    `,
  ];
}

export default PageTitle;
