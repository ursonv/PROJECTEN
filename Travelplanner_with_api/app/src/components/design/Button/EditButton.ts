import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("app-page-edit-button")
class PageEditButton extends LitElement {
  @property()
  onClick: () => void = () => {};

  render() {
    const { onClick } = this;

    return html`
    <div class="page-edit-button">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000" 
      @click=${ onClick } style="cursor: pointer;">
        <path d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"/>
      </svg>
      <slot></slot>
    </div>    
    `;
}

  static styles = [
    css`

    .page-edit-button {
      margin-left: .5rem;
    }

    .page-edit-button:hover svg path {
        fill: var(--green);
    }
    `,
  ];
}

export default PageEditButton;
