import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultButtonStyles, defaultStyles, formStyles } from "@styles/styles";
import { Router } from "@vaadin/router";
import { Expense, ExpenseBody } from "@core/modules/expenses/Expense.types";
import { AxiosResponse } from "axios";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import { getTrips } from "@core/modules/trips/Trip.api";
import { Trip } from "@core/modules/trips/Trip.types";
import formattedDate from "@core/utils/formattedDate";

@customElement("expense-form")
class ExpenseForm extends LitElement {
  @property()
  isLoading: boolean = false;
  @property()
  error: string | null = null;
  @property()
  data: ExpenseBody = {
    description: "",
    date: "",
    amount: "",
    tripId: "",
  };
  @property()
  trips: Array<Trip> | null = null;
  @property()
  submitLabel: String = "Add";
  @property()
  method: ((expense: ExpenseBody) => Promise<AxiosResponse<Expense>>) | null = null;
  @property()
  onSuccess: (() => void) | null = null;

  // called when the element is first connected to the document’s DOM
  connectedCallback(): void {
    super.connectedCallback();
    this.fetchTrips();
  }

  fetchTrips() {
    getTrips()
      .then(({ data }) => {
        this.trips = data;
      })
      .catch((error) => {
        this.error = error;
      });
  }

  handleSubmit = (event: Event) => {
    if (!this.method || !this.trips) {
      return;
    }
  
    event.preventDefault();
  
    const formData = new FormData(event.target as HTMLFormElement);
    const expense = {
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      amount: formData.get("amount") as string,
      tripId: formData.get("tripId") as string,
    };
  
    this.isLoading = true;

    const selectedTrip = this.trips.find((trip) => trip._id === expense.tripId);
  
    if (!selectedTrip) {
      this.isLoading = false;
      this.error = "Invalid trip selected.";
      return;
    }
  

    const expenseDate = new Date(expense.date);
  
    if (
      expenseDate < new Date(selectedTrip.startDate) ||
      expenseDate > new Date(selectedTrip.endDate)
    ) {
      const formattedStartDate = new Date(selectedTrip.startDate).toLocaleDateString();
      const formattedEndDate = new Date(selectedTrip.endDate).toLocaleDateString();
      this.error = `Expense date must be within ${formattedStartDate} and ${formattedEndDate}.`;
      this.isLoading = false;
      return;
    }
  
    this.method(expense)
      .then(() => {
        if (this.onSuccess) {
          this.onSuccess();
        }
        Router.go(`/expenses/`);
      })
      .catch((error) => {
        this.isLoading = false;
        this.error = error.message;
      });
  };
  

  render() {
    const { isLoading, error, submitLabel, handleSubmit, data } = this;

    return html` ${error ? html`<error-view error=${error} />` : ""}
      <form @submit=${handleSubmit}>
        <div class="form-control">
          <label class="form-control__label" for="description">Expense description</label>
          <input
            class="form-control__input"
            type="text"
            name="description"
            id="description"
            .value=${data.description}
            placeholder="Expense awesome"
            ?disabled=${isLoading}
            required
          />
        </div>
        <div class="form-control">
          <label class="form-control__label" for="name">Expense amount (in euro)</label>
          <input
            class="form-control__input"
            type="number"
            name="amount"
            id="amount"
            .value=${data.amount}
            placeholder="Expense awesome"
            ?disabled=${isLoading}
            required
          />
        </div>
        <div class="form-control">
          <label class="form-control__label" for="name">Expense date</label>
          <input
            class="form-control__input"
            type="date"
            name="date"
            id="date"
            .value=${formattedDate(data.date)}
            placeholder="Expense awesome"
            ?disabled=${isLoading}
            required
          />
        </div>
        <div class="form-control">
          <label class="form-control__label" for="description">Trip</label>
          <select
            class="form-control__input"
            type="text"
            name="tripId"
            id="tripId"
            .value=${data.tripId}
            ?disabled=${isLoading}
            required
          >
            <option>--</option>
            ${this.trips?.map((c) => {
              return html`<option value=${c._id} .selected=${c._id === data.tripId}>${c.destination}</option>`;
            })}
          </select>
        </div>
        <button class="primary__button" type="submit" ?disabled=${isLoading}>${submitLabel}</button>
      </form>`;
  }

  static styles = [defaultStyles, formStyles, defaultButtonStyles, 
    css`
    form {
      margin-top: 2rem;
    }
  `];
}

export default ExpenseForm;
