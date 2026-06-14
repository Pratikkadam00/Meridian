import { fireEvent, render } from "@testing-library/react-native";

import { Button, GoldButton, GhostButton, type ButtonVariant } from "../Button";

const VARIANTS: ButtonVariant[] = ["gold", "ghost", "text", "danger"];

describe("Button", () => {
  it("snapshots every variant so an unintended restyle is caught", async () => {
    const { toJSON } = await render(
      <>
        {VARIANTS.map((variant) => (
          <Button key={variant} variant={variant} label={variant} />
        ))}
        <Button variant="gold" label="loading" loading />
        <Button variant="gold" label="disabled" disabled />
      </>,
    );

    expect(toJSON()).toMatchSnapshot();
  });

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
