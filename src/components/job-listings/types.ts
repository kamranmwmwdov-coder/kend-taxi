export interface JobListingUser {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface MyReaction {
  liked: boolean;
  disliked: boolean;
  favorited: boolean;
}

export interface CustomerJobListing {
  id: string;
  title: string;
  category: string;
  contact_phone: string;
  whatsapp_phone: string | null;
  images: string[];
  price: number | null;
  event_date: string | null;
  event_time: string | null;
  address: string;
  description: string | null;
  is_vip: boolean;
  is_urgent: boolean;
  views_count: number;
  likes_count: number;
  dislikes_count: number;
  published_at: string | null;
  created_at: string;
  user: JobListingUser | null;
  myReaction: MyReaction;
}

/** "3 saat əvvəl" formatında nisbi vaxt göstərir. */
export function timeAgo(isoDate: string | null): string {
  if (!isoDate) return "";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "indicə";
  if (minutes < 60) return `${minutes} dəqiqə əvvəl`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat əvvəl`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün əvvəl`;
  const months = Math.floor(days / 30);
  return `${months} ay əvvəl`;
}

export function formatEventDate(dateOnly: string | null): string {
  if (!dateOnly) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateOnly);
  if (!match) return dateOnly;
  const [, year, month, day] = match;
  return `${day}.${month}.${year}`;
}

export function formatEventTime(timeOnly: string | null): string {
  if (!timeOnly) return "";
  return timeOnly.slice(0, 5);
}

export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return "Razılaşma yolu ilə";
  return `${price} AZN`;
}
