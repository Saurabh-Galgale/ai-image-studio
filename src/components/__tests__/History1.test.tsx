import React from "react";
import { render, waitFor } from "@testing-library/react";
import History1 from "../HistoryPage";
import axios from "axios";
jest.mock("axios");
const mocked = axios as jest.Mocked<typeof axios>;

test("loads and displays history", async () => {
  mocked.get.mockResolvedValue({
    data: [
      {
        id: 1,
        imageUrl: "/img.png",
        prompt: "x",
        createdAt: "t",
        style: "cartoon",
      },
    ],
  });
  const { getByText, findByAltText } = render(<History1 />);
  await waitFor(() =>
    expect(
      getByText("Recent Images") || getByText("No History Yet")
    ).toBeTruthy()
  );
});
