import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("app-page-edit-a-button")
class PageEditButton extends LitElement {
  @property()
  href: string | null = null;

  render() {
    const { href } = this;

    return html`
    <a href=${href} class="page-edit-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000">
            <path d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"/>
        </svg>
      <slot></slot>
    </a>    
    `;
}

  static styles = [
    css`
    .page-edit-button {
        text-decoration: none; 
        display: inline-flex; 
        align-items: center; 
    }

    svg:hover path {
        fill: var(--green);
      }
    `,
  ];
}

export default PageEditButton;
