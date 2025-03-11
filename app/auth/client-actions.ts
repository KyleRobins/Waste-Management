"use client";

import { signUpAction, signInAction, signOutAction } from "./server-actions";

export async function signUp(email: string, password: string) {
  return await signUpAction(email, password);
}

export async function signIn(email: string, password: string) {
  return await signInAction(email, password);
}

export async function signOut() {
  return await signOutAction();
}
