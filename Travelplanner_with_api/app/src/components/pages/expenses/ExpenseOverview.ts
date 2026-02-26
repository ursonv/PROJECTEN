import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { deleteExpense, getExpenses } from "@core/modules/expenses/Expense.api";
import { Expense } from "@core/modules/expenses/Expense.types";
import { defaultButtonStyles, defaultStyles } from "@styles/styles";
import { format, parseISO } from "date-fns";

import "@components/design/Button/EditButton";
import "@components/design/Button/DeleteButton";
import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import "@components/design/Typography/PageTitle";
import "@components/design/Button/PageTitleButton";
import { Router } from "@vaadin/router";

@customElement("expense-overview")
class ExpenseOverview extends LitElement {
  @property()
  isLoading: boolean = false;
  @property()
  expenses: Array<Expense> | null = null;
  @property()
  error: string | null = null;

  handleEditExpenseClick = (expenseId: string) => {
    Router.go(`/expenses/${expenseId}/edit`);
  };

  handleDeleteExpenseClick = (expenseId: string) => {
    deleteExpense(expenseId)
      .then(() => {
        console.log("Expense deleted successfully");
        Router.go(`/expenses/`);
      })
      .catch((error) => {
        console.error("Error deleting expense:", error);
      });
  };

  // called when the element is first connected to the document’s DOM
  connectedCallback(): void {
    super.connectedCallback();
    this.fetchItems();
  }

  fetchItems() {
    this.isLoading = true;
    // todo in api
    getExpenses()
      .then(({ data }) => {
        this.expenses = data;
        this.isLoading = false;
      })
      .catch((error) => {
        this.error = error.message;
        this.isLoading = false;
      });
  }

  calculateTotal(expenses: { amount: string }[]): number {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  }

  render() {
    const { isLoading, expenses, error } = this;

    let content = html``;
    if (error) {
      content = html`<error-view error=${error} />`;
    } else if (isLoading || !expenses) {
      content = html`<loading-indicator></loading-indicator>`;
    } else if (expenses.length === 0) {
      content = html`<p>No expenses yet...</p>`;
    } else {
      content = html`
      <div class="c-expense-table"> 
      <table> 
          <thead> 
              <tr> 
                  <th>Title</th>
                  <th>Date</th>
                  <th>Amount</th> 
                  <th>Trip</th> 
                  <th>Action</th> 

              </tr> 
          </thead> 
          <tbody>
          ${expenses.map((c) => {
            return html`
            <tr>
              <td>${c.description}</td>
              <td>${format(parseISO(c.date), "dd-MM-yyyy")}</td>
              <td>€ ${c.amount}</td>
              <td>${c.trip?.destination}</td>
              <td>
                <div class="c-expense_buttons">
                  <app-page-edit-button @click=${() => this.handleEditExpenseClick(c._id)}></app-page-edit-button>
                  <app-page-delete-button @click=${() => this.handleDeleteExpenseClick(c._id)}></app-page-delete-button>
                </div>
              </td>
            </tr>
            `;
          })}
          </tbody> 
          </table> 
          <div class="total-amount"> 
              <strong>Total:</strong>  
              € <span id="total-amount">${this.calculateTotal(expenses)}</span> 
          </div> 
      </div>
      `;
    }

    return html` 
      <div class="title-and-link">
        <app-page-title>Expenses</app-page-title>
        <app-page-title-button href="/expenses/create">Add expense</app-page-title-button>
      </div>
      ${content}`;
  }

  static styles = [defaultStyles, defaultButtonStyles,
  css`
    .c-expense-table { 
      border: 1px solid #ddd; 
      border-radius: 8px; 
      overflow: hidden; 
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
    } 
      
    table { 
      width: 100%; 
      border-collapse: collapse; 
    } 
      
    thead th { 
      background-color: var(--secondary); 
      padding: 10px; 
      text-align: left; 
    } 
      
    tbody td { 
      padding: 10px; 
      border-top: 1px solid #ddd; 
    } 
      
    .delete-btn { 
      color: red; 
      cursor: pointer; 
    } 
      
    .total-amount { 
      padding: 10px; 
      text-align: right; 
      background-color: var(--secondary); 
    }

    .c-expense_buttons {
      display: flex;
    }
  `
  ];
}

export default ExpenseOverview;
