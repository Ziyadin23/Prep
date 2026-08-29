export type ProfileActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: {
    displayName?: string;
  };
};

export const initialProfileState: ProfileActionState = { status: "idle" };
