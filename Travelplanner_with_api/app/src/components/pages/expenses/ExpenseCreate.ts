import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { defaultStyles } from "@styles/styles";
import { createExpense } from "@core/modules/expenses/Expense.api";

import "@components/pages/expenses/form/ExpenseForm";
import "@components/design/Typography/PageTitle";

@customElement("expense-create")
class ExpenseCreate extends LitElement {
  render() {
    return html` <app-page-title>Add expense</app-page-title>
      <expense-form .method=${createExpense}></expense-form>`;
  }

  static styles = [defaultStyles];
}

export default ExpenseCreate;
