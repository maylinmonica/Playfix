import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const Notification = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <>
      <div className="notification-overlay">
        <div className={`notification-container ${type}`}>
          <div className="notification-icon">
            {type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <XCircle size={20} />
            )}
          </div>
          <div className="notification-message">
            {message}
          </div>
        </div>
      </div>
      <style jsx>{`
        /* Notification Styles - Fixed positioning and smooth animation */
        .notification-overlay {
          position: fixed;
          top: 100px;
          left: 0;
          right: 0;
          z-index: 3000;
          pointer-events: none;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 0 20px;
        }

        .notification-container {
          background: rgba(30, 30, 30, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
          min-width: 320px;
          max-width: 500px;
          width: auto;
          pointer-events: auto;
          animation: notificationSlideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transform: translateY(-30px);
          opacity: 0;
        }

        .notification-container.success {
          border-left: 4px solid #00ff00;
        }

        .notification-container.error {
          border-left: 4px solid #ff0000;
        }

        .notification-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notification-container.success .notification-icon {
          color: #00ff00;
        }

        .notification-container.error .notification-icon {
          color: #ff0000;
        }

        .notification-message {
          flex: 1;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
          text-align: left;
        }

        @keyframes notificationSlideDown {
          0% {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          50% {
            opacity: 1;
            transform: translateY(5px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Mobile Responsive */
        @media screen and (max-width: 768px) {
          .notification-overlay {
            top: 90px;
            padding: 0 16px;
          }
          
          .notification-container {
            min-width: 280px;
            max-width: 400px;
          }
        }

        @media screen and (max-width: 480px) {
          .notification-overlay {
            top: 90px;
            padding: 0 12px;
          }
          
          .notification-container {
            padding: 14px 16px;
            gap: 10px;
            min-width: 250px;
            max-width: 350px;
          }
          
          .notification-message {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
};

export default Notification;