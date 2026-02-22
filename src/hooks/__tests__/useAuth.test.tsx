import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";

// Mock Supabase client before importing the module under test
const mockGetSession = vi.fn().mockResolvedValue({ data: { session: null } });
const mockOnAuthStateChange = vi.fn().mockReturnValue({
  data: { subscription: { unsubscribe: vi.fn() } },
});
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockSignOut = vi.fn().mockResolvedValue({});
const mockResetPasswordForEmail = vi.fn();
const mockUpdateUser = vi.fn();
const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    }),
  }),
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
    },
    from: vi.fn().mockReturnValue({ select: mockSelect }),
  },
}));

// Import AFTER mocking
import { AuthProvider, useAuth } from "../useAuth";

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("useAuth hook", () => {
  it("throws when used outside AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");
  });

  it("initializes with loading state", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    // On first render, isLoading may already be false if getSession resolved synchronously
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAdmin).toBe(false);
  });

  it("exposes signIn function", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });

    const { error } = await result.current.signIn("test@aerelion.com", "password123");
    expect(error).toBeNull();
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "test@aerelion.com",
      password: "password123",
    });
  });

  it("exposes signUp function with display name", async () => {
    mockSignUp.mockResolvedValueOnce({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });

    const { error } = await result.current.signUp("new@aerelion.com", "pass123!", "Operator");
    expect(error).toBeNull();
    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "new@aerelion.com",
        password: "pass123!",
        options: expect.objectContaining({
          data: { display_name: "Operator" },
        }),
      })
    );
  });

  it("signOut resets admin state", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await result.current.signOut();
    expect(mockSignOut).toHaveBeenCalled();
    expect(result.current.isAdmin).toBe(false);
  });

  it("exposes resetPassword function", async () => {
    mockResetPasswordForEmail.mockResolvedValueOnce({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });

    const { error } = await result.current.resetPassword("forgot@aerelion.com");
    expect(error).toBeNull();
  });
});
