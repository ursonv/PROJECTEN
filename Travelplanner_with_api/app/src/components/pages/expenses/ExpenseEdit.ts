import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { updateExpense } from "@core/modules/expenses/Expense.api";
import { ExpenseBody } from "@core/modules/expenses/Expense.types";
import { defaultStyles } from "@styles/styles";
import { consume } from "@lit/context";
import { ExpenseContext, expenseContext } from "./ExpenseDetailContainer";

import "@components/pages/expenses/form/ExpenseForm";
import "@components/design/Typography/PageTitle";

@customElement("expense-edit")
class ExpenseEdit extends LitElement {
  @consume({ context: expenseContext, subscribe: true })
  @property({ attribute: false })
  public expenseContextValue?: ExpenseContext | null;

  handleSuccess = () => {
    const { expenseContextValue } = this;

    if (expenseContextValue) {
      expenseContextValue.refresh();
    }
  };

  render() {
    const { expenseContextValue, handleSuccess } = this;

    if (!expenseContextValue || !expenseContextValue.expense) {
      return html``;
    }

    const { expense } = expenseContextValue;

    return html` <app-page-title>Edit expense</app-page-title>
      <expense-form
        submitLabel="Edit"
        .data=${expense}
        .onSuccess=${handleSuccess}
        .method=${(body: ExpenseBody) => updateExpense(expense._id, body)}
      ></expense-form>`;
  }

  static styles = [defaultStyles];
}

export default ExpenseEdit;
