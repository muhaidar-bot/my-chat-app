// Web Notifications and Haptic Vibration utilities

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

export function showPartnerNotification(title: string, body: string, icon = '/icon.svg') {
  // Mobile vibration feedback
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([100, 50, 100]);
    } catch {
      // ignore
    }
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: 'bayyan-muhaidar-message',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (err) {
    console.debug('Notification display error:', err);
  }
}
