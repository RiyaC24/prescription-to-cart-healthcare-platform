import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser, LoginPayload, RegisterPayload, Role } from "@/types/auth";
import { clearStoredTokens, getStoredTokens, setStoredTokens } from "@/lib/tokenStorage";
import { loginRequest, logoutRequest, registerRequest } from "./authApi";

// ---------------------------------------------------------------------------
// MOCK AUTH MODE
// Set this to false to go back to hitting the real backend (loginRequest /
// registerRequest above, which call /auth/login and /auth/register).
// While true, ANY email + password will "work" — nothing is checked against
// a server. This is only meant for local development/demoing the UI before
// the backend is wired up.
// ---------------------------------------------------------------------------
export const MOCK_AUTH = true;

const MOCK_USERS_KEY = "ptc_mock_users";
const MOCK_CURRENT_USER_KEY = "ptc_mock_current_user";

function readMockUsers(): Record<string, { role: Role; firstName?: string; lastName?: string }> {
  try {
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeMockUser(email: string, data: { role: Role; firstName?: string; lastName?: string }) {
  const users = readMockUsers();
  users[email.toLowerCase()] = data;
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function mockAuthResponse(email: string, role: Role) {
  const user: AuthUser = { id: `mock-${email.toLowerCase()}`, email, role };
  localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(user));
  return {
    user,
    accessToken: `mock-access-${Date.now()}`,
    refreshToken: `mock-refresh-${Date.now()}`,
  };
}

export function getMockCurrentUser(): AuthUser | null {
  try {
    return JSON.parse(localStorage.getItem(MOCK_CURRENT_USER_KEY) ?? "null");
  } catch {
    return null;
  }
}

interface AuthState {
  user: AuthUser | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

function extractErrorMessage(err: unknown): string {
  const anyErr = err as { response?: { data?: { message?: string } } };
  return anyErr?.response?.data?.message ?? "Something went wrong. Please try again.";
}

export const login = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      if (MOCK_AUTH) {
        // Any email/password is accepted. If this email registered before,
        // reuse the role they picked; otherwise default to PATIENT.
        const known = readMockUsers()[payload.email.toLowerCase()];
        const result = mockAuthResponse(payload.email, known?.role ?? "PATIENT");
        setStoredTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
        return result.user;
      }
      const result = await loginRequest(payload);
      setStoredTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
      return result.user;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      if (MOCK_AUTH) {
        writeMockUser(payload.email, {
          role: payload.role,
          firstName: payload.firstName,
          lastName: payload.lastName,
        });
        const result = mockAuthResponse(payload.email, payload.role);
        setStoredTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
        return result.user;
      }
      const result = await registerRequest(payload);
      setStoredTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
      return result.user;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  const { refreshToken } = getStoredTokens();
  if (refreshToken && !MOCK_AUTH) {
    try {
      await logoutRequest(refreshToken);
    } catch {
      // Ignore network errors on logout; we clear local state regardless.
    }
  }
  clearStoredTokens();
  if (MOCK_AUTH) {
    localStorage.removeItem(MOCK_CURRENT_USER_KEY);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Login failed";
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Registration failed";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
