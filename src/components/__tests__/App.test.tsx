import { render } from "@testing-library/react";
import App from "../../App";
import { ThemeProvider } from "../../context/ThemeContext";

test("renders without crashing", () => {
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
});
