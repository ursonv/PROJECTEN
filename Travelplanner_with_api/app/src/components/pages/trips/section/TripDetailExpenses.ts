import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultButtonStyles, defaultStyles } from "@styles/styles";
import { consume } from "@lit/context";
import { format, parseISO } from "date-fns";

import { TripContext, tripContext } from "../TripDetailContainer";

import "@components/design/Typography/PageTitle";
import "@components/design/Button/PageTitleButton";
import { deleteExpense } from "@core/modules/expenses/Expense.api";
import { Router } from "@vaadin/router";

@customElement("trip-detail-expenses")
class TripDetailExpenses extends LitElement {
  @consume({ context: tripContext, subscribe: true })
  @property({ attribute: false })
  public tripContextValue?: TripContext | null;

  handleEditExpenseClick = (expenseId: string) => {
    Router.go(`/expenses/${expenseId}/edit`);
  };


  handleDeleteExpenseClick = (expenseId: string) => {
    const { tripContextValue } = this;

    if (tripContextValue && tripContextValue.trip) {

      deleteExpense(expenseId)
        .then(() => {
          console.log("Expense deleted successfully");
          window.location.reload();
        })
        .catch((error) => {
          console.error("Error deleting expense:", error);
        });
    }
  };

  calculateTotal(expenses: { amount: string }[]): number {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  }

  render() {
    const { tripContextValue } = this;

    if (!tripContextValue || !tripContextValue.trip) {
      return html``;
    }

    const { trip } = tripContextValue;

    if (!trip) {
      return html``;
    }

    return html`
    <div class="trip-detail-container">
      <h3 class="trip-detail-container-title">Expenses for ${trip.destination}</h3>

      <div class="c-expense-table"> 
        <table> 
            <thead> 
                <tr> 
                    <th>Title</th>
                    <th>Date</th>
                    <th>Amount</th> 
                    <th>Action</th> 
                </tr> 
            </thead> 
            <tbody>
                ${trip.expenses.length > 0 ? trip.expenses.map(expense => html`
                    <tr>
                        <td>${expense.description}</td>
                        <td>${format(parseISO(expense.date), "dd-MM-yyyy")}</td>
                        <td>€ ${expense.amount}</td>
                        <td>
                          <div class="c-expense_buttons">
                            <app-page-edit-button @click=${() => this.handleEditExpenseClick(expense._id)}></app-page-edit-button>
                            <app-page-delete-button @click=${() => this.handleDeleteExpenseClick(expense._id)}></app-page-delete-button>
                          </div>
                        </td>
                     </tr>
                `) : html`<tr><td colspan="4" class="trip-detail-notfound">No expenses found</td></tr>`}
            </tbody> 
        </table> 
        <div class="total-amount"> 
            <strong>Total:</strong>  
            € <span id="total-amount">${this.calculateTotal(trip.expenses)}</span> 
        </div> 
    </div>
  

  </div>
  `;
  
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


export default TripDetailExpenses;
