"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { getSoundEnabled, notificationSound, setSoundEnabled, subscribeToSoundPreference } from "@/utils/notification-sound";

export function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const sync = () => setEnabled(getSoundEnabled());
    sync();
    return subscribeToSoundPreference(sync);
  }, []);

  async function toggle() {
    const next = !enabled;
    setSoundEnabled(next);
    setEnabled(next);
    if (next) {
      await notificationSound.unlock();
      void notificationSound.play("SYSTEM", "sound-enabled-preview");
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex p-2 text-ink"
      aria-label={enabled ? "Səsi söndür" : "Səsi aktiv et"}
      title={enabled ? "Səs aktivdir" : "Səs söndürülüb"}
    >
      {enabled ? <Volume2 size={21} /> : <VolumeX size={21} />}
    </button>
  );
}
