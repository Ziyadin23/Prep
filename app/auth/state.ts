export type AuthActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: {
    email?: string;
  };
};

export const initialAuthState: AuthActionState = {
  status: "idle",
  message: "",
};
