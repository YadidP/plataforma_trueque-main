
import React, { createContext, useState, useCallback, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  addNotification: (message: string, type: NotificationType) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: NotificationType) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const notificationColors = {
    success: 'bg-green-primary border-green-dark',
    error: 'bg-red-600 border-red-800',
    info: 'bg-blue-600 border-blue-800',
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-5 right-5 z-50 space-y-3">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`px-6 py-4 rounded-lg text-white shadow-lg border-l-4 ${notificationColors[notification.type]}`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
