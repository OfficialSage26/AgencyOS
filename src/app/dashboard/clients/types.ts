// Plain (non-"use server") module: shared types/values for the client actions.
// A "use server" file may only export async functions, so the action state
// shape and its initial value live here and are imported by both the server
// actions and the client components.

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export const initialActionState: ActionState = { ok: false };
