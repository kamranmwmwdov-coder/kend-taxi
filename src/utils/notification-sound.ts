"use client";

export type SoundEvent =
  | "ORDER_CREATED"
  | "ORDER_OFFER"
  | "DRIVER_ACCEPTED"
  | "CUSTOMER_SELECTED"
  | "DRIVER_CONFIRMED"
  | "ORDER_CANCELLED"
  | "ORDER_COMPLETED"
  | "ORDER_STATUS_CHANGED"
  | "SYSTEM";

const PREFERENCE_KEY = "kt_sound_enabled";
const PLAYED_KEY = "kt_played_sound_events";
const PREFERENCE_EVENT = "kt-sound-preference-change";

const SOUND_FILES: Record<SoundEvent, string> = {
  ORDER_CREATED: "/sounds/new-order.wav",
  ORDER_OFFER: "/sounds/new-order.wav",
  DRIVER_ACCEPTED: "/sounds/driver-selected.wav",
  CUSTOMER_SELECTED: "/sounds/driver-selected.wav",
  DRIVER_CONFIRMED: "/sounds/driver-arriving.wav",
  ORDER_CANCELLED: "/sounds/order-cancelled.wav",
  ORDER_COMPLETED: "/sounds/order-completed.wav",
  ORDER_STATUS_CHANGED: "/sounds/driver-confirmed.wav",
  SYSTEM: "/sounds/system.wav",
};

const FALLBACK_TONES: Record<SoundEvent, number[]> = {
  ORDER_CREATED: [523, 659],
  ORDER_OFFER: [784, 988, 784],
  DRIVER_ACCEPTED: [659, 784],
  CUSTOMER_SELECTED: [880, 1047, 880],
  DRIVER_CONFIRMED: [523, 659, 784],
  ORDER_CANCELLED: [440, 330],
  ORDER_COMPLETED: [523, 659, 784],
  ORDER_STATUS_CHANGED: [440, 523],
  SYSTEM: [660],
};

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getSoundEnabled() {
  if (!canUseStorage()) return true;
  return window.localStorage.getItem(PREFERENCE_KEY) !== "false";
}

export function setSoundEnabled(enabled: boolean) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(PREFERENCE_KEY, String(enabled));
  window.dispatchEvent(new Event(PREFERENCE_EVENT));
}

export function subscribeToSoundPreference(listener: () => void) {
  if (!canUseStorage()) return () => undefined;
  window.addEventListener(PREFERENCE_EVENT, listener);
  return () => window.removeEventListener(PREFERENCE_EVENT, listener);
}

class NotificationSoundManager {
  private context: AudioContext | null = null;
  private played = new Set<string>();
  private queued = new Map<string, SoundEvent>();
  private files = new Map<SoundEvent, HTMLAudioElement>();
  private missingFiles = new Set<string>();

  constructor() {
    if (canUseStorage()) {
      try {
        const saved = JSON.parse(window.sessionStorage.getItem(PLAYED_KEY) ?? "[]");
        if (Array.isArray(saved)) saved.forEach((key) => this.played.add(String(key)));
      } catch {
        // A corrupt cache must never affect notifications.
      }
    }
  }

  async unlock() {
    if (typeof window === "undefined") return false;
    const AudioContextConstructor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextConstructor) return false;
    this.context ??= new AudioContextConstructor();
    try {
      await this.context.resume();
      const unlocked = this.context.state === "running";
      if (unlocked) {
        const pending = Array.from(this.queued.entries()).slice(-3);
        this.queued.clear();
        pending.forEach(([key, event]) => this.play(event, key));
      }
      return unlocked;
    } catch {
      return false;
    }
  }

  async play(event: SoundEvent, uniqueKey: string) {
    if (!getSoundEnabled() || this.played.has(uniqueKey) || this.queued.has(uniqueKey)) return false;

    // An audio element uses the public sound file when it is available. The short
    // Web Audio tone is a safe fallback for browsers or deployments missing it.
    const filePlayed = await this.playFile(event);
    if (filePlayed) {
      this.remember(uniqueKey);
      return true;
    }
    if (this.context?.state === "running") {
      this.playTone(event);
      this.remember(uniqueKey);
      return true;
    }

    // Keep only a small backlog until the next user gesture unlocks browser audio.
    this.queued.set(uniqueKey, event);
    if (this.queued.size > 3) this.queued.delete(this.queued.keys().next().value!);
    return false;
  }

  private remember(key: string) {
    this.played.add(key);
    if (!canUseStorage()) return;
    try {
      const latest = Array.from(this.played).slice(-250);
      window.sessionStorage.setItem(PLAYED_KEY, JSON.stringify(latest));
    } catch {
      // Storage being unavailable should not prevent a sound in the current tab.
    }
  }

  private async playFile(event: SoundEvent) {
    if (typeof Audio === "undefined") return false;
    const path = SOUND_FILES[event];
    if (this.missingFiles.has(path)) return false;
    let audio = this.files.get(event);
    if (!audio) {
      audio = new Audio(path);
      audio.preload = "auto";
      audio.addEventListener("error", () => this.missingFiles.add(path));
      this.files.set(event, audio);
    }
    try {
      audio.currentTime = 0;
      await audio.play();
      return true;
    } catch {
      // A media error means this asset is unavailable; autoplay rejections do not
      // populate audio.error and must remain eligible after the next user gesture.
      if (audio.error) this.missingFiles.add(path);
      return false;
    }
  }

  private playTone(event: SoundEvent) {
    if (!this.context || this.context.state !== "running") return;
    const start = this.context.currentTime;
    FALLBACK_TONES[event].forEach((frequency, index) => {
      const oscillator = this.context!.createOscillator();
      const gain = this.context!.createGain();
      const at = start + index * 0.14;
      oscillator.type = event === "ORDER_OFFER" || event === "CUSTOMER_SELECTED" ? "square" : "sine";
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.08, at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);
      oscillator.connect(gain).connect(this.context!.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.13);
    });
  }
}

export const notificationSound = new NotificationSoundManager();
