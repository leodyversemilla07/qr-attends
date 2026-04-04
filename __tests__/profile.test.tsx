import React from "react";
import renderer, { act } from "react-test-renderer";
import { Switch } from "react-native";
import Profile from "../app/(tabs)/profile";

const mockUseAuth = jest.fn();
const mockUseAppTheme = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, null, children);
  },
}));

jest.mock("@/utils/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("@/utils/theme-context", () => ({
  useAppTheme: () => mockUseAppTheme(),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children }: { children: React.ReactNode }) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, null, children);
  },
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, null, children);
  },
}));

jest.mock("@/components/ui/icon-symbol", () => ({
  IconSymbol: () => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View);
  },
}));

jest.mock("@/components/ui/typography", () => ({
  MsHeading: ({ children }: { children: React.ReactNode }) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, null, children);
  },
  MsText: ({ children }: { children: React.ReactNode }) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, null, children);
  },
}));

jest.mock("react-native-paper", () => ({
  useTheme: () => ({
    colors: {
      background: "#fff",
      onSurfaceVariant: "#64748B",
      outline: "#E2E8F0",
    },
    dark: false,
  }),
}));

describe("Profile Screen", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      officer: {
        _id: "officer-1",
        name: "Officer Name",
        email: "officer@example.com",
        role: "Officer",
      },
      signOut: jest.fn(),
      notificationsEnabled: true,
      toggleNotifications: jest.fn(),
    });

    mockUseAppTheme.mockReturnValue({
      theme: "light",
      toggleTheme: jest.fn(),
    });
  });

  it("binds the push notification switch to auth context state", () => {
    const toggleNotifications = jest.fn();
    mockUseAuth.mockReturnValue({
      officer: {
        _id: "officer-1",
        name: "Officer Name",
        email: "officer@example.com",
        role: "Officer",
      },
      signOut: jest.fn(),
      notificationsEnabled: true,
      toggleNotifications,
    });

    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<Profile />);
    });

    const switches = tree!.root.findAllByType(Switch);

    expect(switches[0].props.value).toBe(true);

    act(() => {
      switches[0].props.onValueChange(false);
    });

    expect(toggleNotifications).toHaveBeenCalledWith(false);
  });
});
