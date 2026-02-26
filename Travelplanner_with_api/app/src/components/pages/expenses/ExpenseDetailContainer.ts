import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getExpenseById } from "@core/modules/expenses/Expense.api";
import { Expense } from "@core/modules/expenses/Expense.types";
import { router } from "@core/router";
import { defaultStyles } from "@styles/styles";
import { createContext, provide } from "@lit/context";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";

export type ExpenseContext = {
  expense: Expense | null;
  refresh: () => void;
};

export const expenseContext = createContext<ExpenseContext | null>("expense");

@customElement("expense-detail-container")
class ExpenseDetailContainer extends LitElement {
  @property()
  isLoading: boolean = false;
  @provide({ context: expenseContext })
  expenseContext: ExpenseContext | null = null;
  @property()
  error: string | null = null;

  @property({ type: Object }) location = router.location;

  // called when the element is first connected to the document’s DOM
  connectedCallback(): void {
    super.connectedCallback();
    this.expenseContext = {
      expense: null,
      refresh: this.fetchItem,
    };
    this.fetchItem();
  }

  // arrow function! otherwise "this" won't work in context provider
  fetchItem = () => {
    if (!this.location.params.id || typeof this.location.params.id !== "string") {
      return;
    }

    this.isLoading = true;
    getExpenseById(this.location.params.id)
      .then(({ data }) => {
        this.expenseContext = {
          expense: data,
          refresh: this.fetchItem,
        };
        this.isLoading = false;
      })
      .catch((error) => {
        this.error = error.message;
        this.isLoading = false;
      });
  };

  render() {
    const { isLoading, expenseContext, error } = this;

    if (!expenseContext) {
      return html``;
    }

    const { expense } = expenseContext;

    if (error) {
      return html`<error-view error=${error} />`;
    }

    if (isLoading || !expense) {
      return html`<loading-indicator></loading-indicator>`;
    }

    return html`<slot></slot>`;
  }

  static styles = [defaultStyles];
}

export default ExpenseDetailContainer;
