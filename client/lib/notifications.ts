import type { OrderStatus } from "./storefront";

export const DELIVERY_STATUSES: OrderStatus[] = ["shipped", "delivered"];
export const STATUS_SNAPSHOT_KEY_PREFIX = "locomotive_order_status_snapshot_";
export const NOTIFICATIONS_KEY_PREFIX = "locomotive_user_notifications_";
export const NOTIFICATIONS_LAST_SEEN_KEY_PREFIX = "locomotive_user_notifications_last_seen_";
export const MAX_NOTIFICATIONS = 30;
export const NOTIFICATIONS_CHANGED_EVENT = "locomotive-notifications-changed";

export type UserNotification = {
  id: string;
  orderId: string;
  itemName: string;
  status: OrderStatus;
  kind: "order" | "delivery";
  createdAt: string;
};

const notificationsKey = (walletAddress: string) =>
  `${NOTIFICATIONS_KEY_PREFIX}${walletAddress.toLowerCase()}`;

const lastSeenKey = (walletAddress: string) =>
  `${NOTIFICATIONS_LAST_SEEN_KEY_PREFIX}${walletAddress.toLowerCase()}`;

export const readNotifications = (walletAddress: string): UserNotification[] => {
  try {
    const raw = window.localStorage.getItem(notificationsKey(walletAddress));
    return raw ? (JSON.parse(raw) as UserNotification[]) : [];
  } catch {
    return [];
  }
};

export const writeNotifications = (walletAddress: string, notifications: UserNotification[]) => {
  window.localStorage.setItem(notificationsKey(walletAddress), JSON.stringify(notifications));
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT, { detail: { walletAddress } }));
};

export const appendNotification = (walletAddress: string, notification: UserNotification): UserNotification[] => {
  const current = readNotifications(walletAddress);
  const next = [notification, ...current].slice(0, MAX_NOTIFICATIONS);
  writeNotifications(walletAddress, next);
  return next;
};

export const clearNotifications = (walletAddress: string) => {
  window.localStorage.removeItem(notificationsKey(walletAddress));
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT, { detail: { walletAddress } }));
};

export const readLastSeenAt = (walletAddress: string): string | null =>
  window.localStorage.getItem(lastSeenKey(walletAddress));

export const markAllAsRead = (walletAddress: string) => {
  const nowIso = new Date().toISOString();
  window.localStorage.setItem(lastSeenKey(walletAddress), nowIso);
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT, { detail: { walletAddress } }));
  return nowIso;
};

export const countUnreadNotifications = (
  notifications: UserNotification[],
  lastSeenAt: string | null,
) => {
  if (!lastSeenAt) {
    return notifications.length;
  }

  const seenTime = +new Date(lastSeenAt);
  if (Number.isNaN(seenTime)) {
    return notifications.length;
  }

  return notifications.filter((notification) => +new Date(notification.createdAt) > seenTime).length;
};
