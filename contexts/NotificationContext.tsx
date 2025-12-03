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

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((message: string, type: NotificationType) => {
    // CAMBIO: Añadimos Math.random() para asegurar unicidad incluso en el mismo milisegundo
    const id = Date.now() + Math.random(); 
    
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto cerrar después de 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const getStyles = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'bg-green-600 text-white border-green-700';
      case 'error': return 'bg-red-600 text-white border-red-700';
      default: return 'bg-blue-600 text-white border-blue-700';
    }
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-20 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`flex items-center justify-between px-4 py-3 rounded-lg shadow-xl border-l-4 transform transition-all duration-300 hover:scale-102 animate-in slide-in-from-right fade-in ${getStyles(notification.type)}`}
          >
            <span className="font-medium text-sm">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 text-white/80 hover:text-white focus:outline-none font-bold text-lg"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
