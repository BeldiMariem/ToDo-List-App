export interface AuthState {
  readonly token: string | null;
  readonly loading: boolean;
  readonly error: string | null;
}