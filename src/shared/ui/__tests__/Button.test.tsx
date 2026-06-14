import { fireEvent, render } from "@testing-library/react-native";

import { GoldButton, GhostButton } from "../Button";

describe("Button", () => {
  it("renders and fires the gold button action", async () => {
    const onPress = jest.fn();
    const { getByText, toJSON } = await render(<GoldButton label="Save deal" onPress={onPress} />);

    fireEvent.press(getByText("Save deal"));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders the ghost button label", async () => {
    const { getByText } = await render(<GhostButton label="Refresh schedule" />);

    expect(getByText("Refresh schedule")).toBeTruthy();
  });
});
