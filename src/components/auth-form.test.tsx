import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "@/components/auth-form";
import { I18nProvider } from "@/i18n/client";
import type { Locale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { ApiError } from "@/types/api";

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  storeAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    refresh: mocks.refresh,
  }),
}));

vi.mock("@/services/api", () => ({
  publicPulseApi: {
    login: mocks.login,
    register: mocks.register,
  },
}));

vi.mock("@/services/auth-storage", () => ({
  storeAuth: mocks.storeAuth,
}));

describe("AuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates required fields before login", () => {
    renderAuthForm("login");

    fireEvent.submit(screen.getByRole("button", { name: "Log in" }).closest("form")!);

    expect(screen.getByText("Enter an email and password.")).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it("validates required fields before login in Swahili", () => {
    renderAuthForm("login", "sw");

    fireEvent.submit(screen.getByRole("button", { name: "Ingia" }).closest("form")!);

    expect(screen.getByText("Weka barua pepe na nenosiri.")).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it("logs in, stores auth, and navigates to reports", async () => {
    const user = userEvent.setup();
    const auth = {
      userId: "user-1",
      email: "citizen@example.com",
      token: "token-1",
      expiresAtUtc: "2026-05-11T10:00:00Z",
    };

    mocks.login.mockResolvedValue(auth);

    renderAuthForm("login");

    await user.type(screen.getByLabelText("Email"), " citizen@example.com ");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(mocks.login).toHaveBeenCalledWith({
        email: "citizen@example.com",
        password: "password123",
      });
    });
    expect(mocks.storeAuth).toHaveBeenCalledWith(auth);
    expect(mocks.push).toHaveBeenCalledWith("/en/reports");
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("registers new users through the register API", async () => {
    const user = userEvent.setup();
    const auth = {
      userId: "user-2",
      email: "new@example.com",
      token: "token-2",
      expiresAtUtc: "2026-05-11T10:00:00Z",
    };

    mocks.register.mockResolvedValue(auth);

    renderAuthForm("register");

    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(mocks.register).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "password123",
      });
    });
    expect(mocks.storeAuth).toHaveBeenCalledWith(auth);
  });

  it("renders backend validation errors beside their auth fields", async () => {
    const user = userEvent.setup();
    mocks.register.mockRejectedValue(
      new ApiError("One or more validation failures have occurred.", 400, {
        validationErrors: {
          email: ["Email is already registered."],
          password: ["Password must be at least 8 characters."],
        },
      }),
    );

    renderAuthForm("register");

    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(
      await screen.findByText("One or more validation failures have occurred."),
    ).toBeInTheDocument();
    expect(screen.getByText("Email is already registered.")).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
  });
});

function renderAuthForm(mode: "login" | "register", locale: Locale = "en") {
  return render(
    <I18nProvider locale={locale} messages={messages[locale]}>
      <AuthForm mode={mode} />
    </I18nProvider>,
  );
}
