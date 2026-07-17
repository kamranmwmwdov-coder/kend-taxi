"use client";

import { useEffect, useState } from "react";
import { MaskIcon } from "@/components/MaskIcon";
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
      className={`inline-flex p-2 ${enabled ? "text-primary" : "text-ink-muted"}`}
      aria-label={enabled ? "Səsi söndür" : "Səsi aktiv et"}
      title={enabled ? "Səs aktivdir" : "Səs söndürülüb"}
    >
      <MaskIcon src="/icons/speaker.svg" className="h-[21px] w-[21px]" />
    </button>
  );
}
