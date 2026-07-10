"use client";

import { create } from "zustand";

export type ToastTone = "success" | "error";

type ToastEntry = {
  id: string;
  tone: ToastTone;
  message: string;
};

type ToastState = {
  toasts: ToastEntry[];
  push: (tone: ToastTone, message: string) => void;
  dismiss: (id: string) => void;
};

const AUTO_DISMISS_MS = 2600;

let nextToastId = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (tone, message) => {
    const id = `toast-${++nextToastId}`;
    set({ toasts: [...get().toasts, { id, tone, message }] });
    window.setTimeout(() => get().dismiss(id), AUTO_DISMISS_MS);
  },
  dismiss: (id) => {
    set({ toasts: get().toasts.filter((toast) => toast.id !== id) });
  },
}));

export function showToast(tone: ToastTone, message: string) {
  useToastStore.getState().push(tone, message);
}
