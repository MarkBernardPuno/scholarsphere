import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import { AuthProvider } from "./contexts/auth-context";
import { DataProvider } from "./contexts/data-context";

import { Provider } from "react-redux";
import ProtectedRoutes from "./components/protectedroute";
import Forgotpassword from "./Pages/Authentication/Forgot";
import LandingPage from "./Pages/Authentication/landing-page";
import LoginPage from "./Pages/Authentication/login-page";
import SignupPage from "./Pages/Authentication/signup-page";
import ApplyIncentives1 from "./Pages/ApplyIncentives/ApplyIncentives1";
import ApplyIncentives2 from "./Pages/ApplyIncentives/ApplyIncentives2";
import ApplyIncentivesC1 from "./Pages/ApplyIncentives/ApplyIncentivesC1";
import ApplyIncentivesC2 from "./Pages/ApplyIncentives/ApplyIncentivesC2";
import ApplyIncentivesC3 from "./Pages/ApplyIncentives/ApplyIncentivesC3";
import ApplyIncentivesC4 from "./Pages/ApplyIncentives/ApplyIncentivesC4";
import ApplyIncentivesC5 from "./Pages/ApplyIncentives/ApplyIncentivesC5";
import ApplyIncentivesC6 from "./Pages/ApplyIncentives/ApplyIncentivesC6";
import ApplyIncentivesC7 from "./Pages/ApplyIncentives/ApplyIncentivesC7";
import CategoryFive from "./Pages/Categories/CategoryFive/CategoryFive";
import CategoryFour from "./Pages/Categories/CategoryFour/CategoryFour";
import CategoryOne from "./Pages/Categories/CategoryOne/CategoryOne";
import CategorySeven from "./Pages/Categories/CategorySeven/CategorySeven";
import CategorySix from "./Pages/Categories/CategorySix/CategorySix";
import CategoryThree from "./Pages/Categories/CategoryThree/CategoryThree";
import CategoryTwo from "./Pages/Categories/CategoryTwo/CategoryTwo";
import NotFoundPage from "./Pages/no-page";
import ResearchIncentives from "./Pages/ReseachIncentives/ResearchIncentives";
import ResearchEvalForm from "./Pages/ResearchEvalForm/ResearchEvalForm";
import ResearcherProfile from "./Pages/ResearchProfile/Researcher-Profile";
import Create from "./Pages/Search/Admin/Create";
import Edit from "./Pages/Search/Admin/EditResearcher";
import SearchResult from "./Pages/Search/Admin/SearchAdmin";
import MainSearch from "./Pages/Search/MainSearch/mainSearch";
import Search from "./Pages/Search/Researcher/SearchResearcher";
import ApplicationsPage from "./Pages/UserPages/applications-page";
import IncentivesPage from "./Pages/UserPages/incentives-page";
import DepartmentsPage from "./Pages/UserPages/departments-page";
import NotificationPage from "./Pages/UserPages/notifications-page";
import ProfilePage from "./Pages/UserPages/profile-page";
import ResearchersPage from "./Pages/UserPages/researchers-page";
import DashboardPage from "./Pages/UserPages/dashboard-page";
import store from "./redux/store/store";
import CategoriesPage from "./Pages/UserPages/categories-page";

const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "forgot",
    element: <Forgotpassword />,
  },
  {
    path: "signup",
    element: <SignupPage />,
  },
  {
    path: "/search/create",
    element: <Create />,
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        path: "/mainSearch",
        element: <MainSearch />,
      },
      {
        path: "/crud",
        element: <SearchResult />,
      },
      {
        path: "/search",
        element: <Search />,
      },
      {
        path: "/search/:application_id",
        element: <Edit />,
      },
      {
        path: "/researcher/:author_id",
        element: <ResearcherProfile />,
      },
      {
        path: "/profile/:author_id/researches",
        element: <ProfilePage />,
      },
      // {
      //   path: "profile/notifications",
      //   element: <NotificationPage />,
      // },
      {
        path: "profile/Research Evaluation",
        element: <ApplicationsPage />,
      },
      {
        path: "profile/Research Incentives",
        element: <IncentivesPage />,
      },
      {
        path: "profile/researchers",
        element: <ResearchersPage />,
      },
      {
        path: "profile/departments",
        element: <DepartmentsPage />,
      },
      {
        path: "profile/search",
        element: <MainSearch />,
      },
      {
        path: "profile/categories",
        element: <CategoriesPage />,
      },
      {
        path: "incentives-application",
        element: <ResearchIncentives />,
      },
      {
        path: "category-1",
        element: <CategoryOne />,
      },
      {
        path: "category-2",
        element: <CategoryTwo />,
      },
      {
        path: "category-3",
        element: <CategoryThree />,
      },
      {
        path: "category-4",
        element: <CategoryFour />,
      },
      {
        path: "category-5",
        element: <CategoryFive />,
      },
      {
        path: "category-6",
        element: <CategorySix />,
      },
      {
        path: "category-7",
        element: <CategorySeven />,
      },
      {
        path: "apply-incentive/:evaluationId",
        element: <ApplyIncentives1 />,
      },
      {
        path: "apply-category-1/:evaluationId",
        element: <ApplyIncentivesC1 />,
      },
      {
        path: "apply-category-2/:evaluationId",
        element: <ApplyIncentivesC2 />,
      },
      {
        path: "apply-category-3/:evaluationId",
        element: <ApplyIncentivesC3 />,
      },
      {
        path: "apply-category-4/:evaluationId",
        element: <ApplyIncentivesC4 />,
      },
      {
        path: "apply-category-5/:evaluationId",
        element: <ApplyIncentivesC5 />,
      },
      {
        path: "apply-category-6/:evaluationId",
        element: <ApplyIncentivesC6 />,
      },
      {
        path: "apply-category-7/:evaluationId",
        element: <ApplyIncentivesC7 />,
      },
      {
        path: "submit-incentive/:evaluationId",
        element: <ApplyIncentives2 />,
      },
      {
        path: "research-eval-form",
        element: <ResearchEvalForm />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <AuthProvider>
      <DataProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </DataProvider>
    </AuthProvider>
  </Provider>
);
