import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultButtonStyles, defaultStyles } from "@styles/styles";
import { consume } from "@lit/context";
import { ExpenseContext, expenseContext } from "./ExpenseDetailContainer";

import "@components/design/Typography/PageTitle";
import "@components/design/Button/PageTitleButton";
import { deleteExpense } from "@core/modules/expenses/Expense.api";
import { Router } from "@vaadin/router";

@customElement("expense-detail")
class ExpenseDetail extends LitElement {
  @consume({ context: expenseContext, subscribe: true })
  @property({ attribute: false })
  public expenseContextValue?: ExpenseContext | null;

  handleDeleteClick = () => {
    const { expenseContextValue } = this;

    if (expenseContextValue && expenseContextValue.expense) {
      const expenseId = expenseContextValue.expense._id;

      deleteExpense(expenseId)
        .then(() => {
          Router.go("/expenses");
          console.log("Expense deleted successfully");
        })
        .catch((error) => {
          console.error("Error deleting expense:", error);
        });
    }
  };

  render() {
    const { expenseContextValue } = this;

    if (!expenseContextValue || !expenseContextValue.expense) {
      return html``;
    }

    const { expense } = expenseContextValue;

    return html`
      <div class="title-and-link">
        <app-page-title>${expense.description}</app-page-title>
        <app-page-title-button href="/expenses/${expense._id}/edit">Edit Expense</app-page-title-button>
        <button @click=${this.handleDeleteClick}>Delete Expense</button>
      </div>
    `;
  }

  static styles = [defaultStyles, defaultButtonStyles];
}

export default ExpenseDetail;
