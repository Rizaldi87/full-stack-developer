import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthProvider, useAuth } from "../auth/AuthContext";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import JobListPage from "../pages/jobs/JobListPage";
import JobDetailPage from "../pages/jobs/JobDetailPage";
import MyApplicationsPage from "../pages/seeker/MyApplicationsPage";
import CompanyJobsPage from "../pages/company/CompanyJobsPage";
import CreateJobPage from "../pages/company/CreateJobPage";
import ApplicantsPage from "../pages/company/ApplicantsPage";

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return (
    <Navigate
      to={user ? (user.role === "COMPANY" ? "/company/jobs" : "/jobs") : "/login"}
      replace
    />
  );
}

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      {
        element: <Layout />,
        children: [
          {
            element: <ProtectedRoute allowed={["JOB_SEEKER"]} />,
            children: [
              { path: "/jobs", element: <JobListPage /> },
              { path: "/jobs/:id", element: <JobDetailPage /> },
              { path: "/my-applications", element: <MyApplicationsPage /> },
            ],
          },
          {
            element: <ProtectedRoute allowed={["COMPANY"]} />,
            children: [
              { path: "/company/jobs", element: <CompanyJobsPage /> },
              { path: "/company/jobs/new", element: <CreateJobPage /> },
              { path: "/company/jobs/:id/applicants", element: <ApplicantsPage /> },
            ],
          },
        ],
      },
      { path: "/", element: <HomeRedirect /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);