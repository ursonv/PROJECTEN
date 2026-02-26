import "./style/main.css";


import { router } from "@core/router";

import "@components/app/App";

const routes = [
  {
    path: "/",
    component: "my-app",
    children: [
      {
        path: "/",
        component: "auth-container",
        action: async () => {
          await import("@components/auth/AuthContainer");
        },
        children: [
          {
            path: "/",
            component: "trip-overview",
            action: async () => {
              await import("@components/pages/trips/TripOverview");
            },
          },
          {
            path: "trips",
            component: "trip-overview",
            action: async () => {
              await import("@components/pages/trips/TripOverview");
            },
          },
          {
            path: "trips/create",
            component: "trip-create",
            action: async () => {
              await import("@components/pages/trips/TripCreate");
            },
          },
          {
            path: "trips/:id",
            component: "trip-detail-container",
            action: async () => {
              await import("@components/pages/trips/TripDetailContainer");
            },
            children: [
              {
                path: "/",
                component: "trip-detail",
                action: async () => {
                  await import("@components/pages/trips/TripDetail");
                },
              },
              {
                path: "/edit",
                component: "trip-edit",
                action: async () => {
                  await import("@components/pages/trips/TripEdit");
                },
              },
            ],
          },
          {
            path: "activities",
            component: "activity-overview",
            action: async () => {
              await import("@components/pages/activities/ActivityOverview");
            },
          },
          {
            path: "activities/create",
            component: "activity-create",
            action: async () => {
              await import("@components/pages/activities/ActivityCreate");
            },
          },
          {
            path: "activities/:id",
            component: "activity-detail-container",
            action: async () => {
              await import("@components/pages/activities/ActivityDetailContainer");
            },
            children: [
              {
                path: "/",
                component: "activity-detail",
                action: async () => {
                  await import("@components/pages/activities/ActivityDetail");
                },
              },
              {
                path: "/edit",
                component: "activity-edit",
                action: async () => {
                  await import("@components/pages/activities/ActivityEdit");
                },
              },
            ],
          },
          {
            path: "expenses",
            component: "expense-overview",
            action: async () => {
              await import("@components/pages/expenses/ExpenseOverview");
            },
          },
          {
            path: "expenses/create",
            component: "expense-create",
            action: async () => {
              await import("@components/pages/expenses/ExpenseCreate");
            },
          },
          {
            path: "expenses/:id",
            component: "expense-detail-container",
            action: async () => {
              await import("@components/pages/expenses/ExpenseDetailContainer");
            },
            children: [
              {
                path: "/",
                component: "expense-detail",
                action: async () => {
                  await import("@components/pages/expenses/ExpenseDetail");
                },
              },
              {
                path: "/edit",
                component: "expense-edit",
                action: async () => {
                  await import("@components/pages/expenses/ExpenseEdit");
                },
              },
            ],
          },
          {
            path: "notes",
            component: "note-overview",
            action: async () => {
              await import("@components/pages/notes/NoteOverview");
            },
          },
          {
            path: "notes/create",
            component: "note-create",
            action: async () => {
              await import("@components/pages/notes/NoteCreate");
            },
          },
          {
            path: "notes/:id",
            component: "note-detail-container",
            action: async () => {
              await import("@components/pages/notes/NoteDetailContainer");
            },
            children: [
              {
                path: "/",
                component: "note-detail",
                action: async () => {
                  await import("@components/pages/notes/NoteDetail");
                },
              },
              {
                path: "/edit",
                component: "note-edit",
                action: async () => {
                  await import("@components/pages/notes/NoteEdit");
                },
              },
            ],
          },
        ],
      },
      {
        path: "login",
        component: "login-page",
        action: async () => {
          await import("@components/auth/Login");
        },
      },
      {
        path: "register",
        component: "register-page",
        action: async () => {
          await import("@components/auth/Register");
        },
      },
    ],
  },
];
  
  router.setRoutes(routes);