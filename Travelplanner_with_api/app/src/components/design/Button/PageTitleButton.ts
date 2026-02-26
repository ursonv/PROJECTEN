import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("app-page-title-button")
class PageTitleButton extends LitElement {
  @property()
  href: string | null = null;

  render() {
    const { href } = this;

    return html`
    <a href=${href} class="page-title-button">
      <slot></slot>
    </a>    
    `;
}

  static styles = [
    css`
      a.page-title-button {
        display: inline-block;
        background-color: var(--green);
        color: white;
        font-weight: bold;
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
      }

      a.page-title-button:hover {
        background-color: var(--primary);
      }
      
      a.page-title-button::after {
        content: "+";
        font-size: 1.2rem;
        margin-left: .5rem;
        padding-left: .5rem;
        border-left: 1px dotted;
      }
    `,
  ];
}

export default PageTitleButton;
