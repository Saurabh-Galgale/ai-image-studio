import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import ProtectedRoute from "../ProtectedRoute";

// mock Navigate to avoid real routing
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

describe("ProtectedRoute", () => {
  test("redirects when token missing", () => {
    localStorage.removeItem("token");

    const { getByText } = render(
      <MemoryRouter initialEntries={["/"]}>
        <ProtectedRoute>
          <div>nope</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByText("redirect /")).toBeInTheDocument();
  });

  test("renders children when token exists", () => {
    localStorage.setItem("token", "fake-token");

    const { getByText } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>ok</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByText("ok")).toBeInTheDocument();
  });
});
