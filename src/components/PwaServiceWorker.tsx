"use client";

import { useEffect } from "react";

/** Registers the worker used for PWA installation and future Web Push delivery. */
export function PwaServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // PWA support is optional; a registration failure must not affect the app.
    });
  }, []);

  return null;
}
