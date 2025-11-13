import { useState } from 'react';
import { Debt } from '../../services/debtService';
import { RequestPaymentModal } from './RequestPaymentModal';
import styles from './DebtCard.module.css';

interface User {
  email: string;
  role: string;
  name?: string;
  nickname?: string;
}

interface DebtCardProps {
  debt: Debt;
  type: 'owed' | 'owing'; // owed = que debo, owing = que me deben
  currentUser: User;
  isSpanish: boolean;
  onRequestPayment?: (description: string) => void;
  onMarkCompleted?: () => void;
  getAssassinName: (assassinId: string) => string;
  onRefresh: () => void;
}

export const DebtCard = ({
  debt,
  type,
  isSpanish,
  onRequestPayment,
  onMarkCompleted,
  getAssassinName,
  onRefresh
}: DebtCardProps) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getStatusBadge = () => {
    switch (debt.status) {
      case 'active':
        return {
          icon: '✅',
          text: isSpanish ? 'Activa' : 'Active',
          className: styles.statusActive
        };
      case 'payment_requested':
        return {
          icon: '🔴',
          text: isSpanish ? 'Pago Solicitado' : 'Payment Requested',
          className: styles.statusPaymentRequested
        };
      case 'in_progress':
        return {
          icon: '⏳',
          text: isSpanish ? 'En Curso' : 'In Progress',
          className: styles.statusInProgress
        };
      case 'rejected':
        return {
          icon: '🎯',
          text: isSpanish ? 'Rechazada' : 'Rejected',
          className: styles.statusRejected
        };
      default:
        return {
          icon: '❓',
          text: debt.status,
          className: ''
        };
    }
  };

  const statusBadge = getStatusBadge();
  const otherAssassinId = type === 'owed' ? debt.creditorId : debt.debtorId;
  const otherAssassinName = getAssassinName(otherAssassinId);

  const handleRequestPayment = (description: string) => {
    if (onRequestPayment) {
      onRequestPayment(description);
      setShowPaymentModal(false);
      onRefresh();
    }
  };

  const handleMarkCompleted = () => {
    if (onMarkCompleted) {
      if (confirm(isSpanish 
        ? '¿Confirmas que has completado el pago de esta deuda?' 
        : 'Do you confirm that you have completed payment of this debt?')) {
        onMarkCompleted();
        onRefresh();
      }
    }
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>
              {otherAssassinName.charAt(0).toUpperCase()}
            </div>
            <div className={styles.info}>
              <p className={styles.label}>
                {type === 'owed' 
                  ? (isSpanish ? 'Con: ' : 'With: ')
                  : (isSpanish ? 'De: ' : 'From: ')}
              </p>
              <p className={styles.assassinName}>{otherAssassinName}</p>
            </div>
          </div>
          <div className={`${styles.statusBadge} ${statusBadge.className}`}>
            <span>{statusBadge.icon}</span>
            <span>{statusBadge.text}</span>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.favorSection}>
            <p className={styles.favorLabel}>
              {isSpanish ? 'Favor Original:' : 'Original Favor:'}
            </p>
            <p className={styles.favorDescription}>"{debt.favorDescription}"</p>
          </div>

          {debt.paymentDescription && (
            <div className={styles.paymentSection}>
              <p className={styles.paymentLabel}>
                {isSpanish ? 'Pago Solicitado:' : 'Payment Requested:'}
              </p>
              <p className={styles.paymentDescription}>"{debt.paymentDescription}"</p>
            </div>
          )}

          <div className={styles.dates}>
            <span className={styles.date}>
              {isSpanish ? 'Creada: ' : 'Created: '}
              {new Date(debt.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          {type === 'owing' && debt.status === 'active' && (
            <button
              className={styles.requestPaymentButton}
              onClick={() => setShowPaymentModal(true)}
            >
              <span>💰</span>
              <span>{isSpanish ? 'Solicitar Pago' : 'Request Payment'}</span>
            </button>
          )}

          {type === 'owed' && debt.status === 'in_progress' && (
            <button
              className={styles.markCompletedButton}
              onClick={handleMarkCompleted}
            >
              <span>✅</span>
              <span>{isSpanish ? 'Marcar como Completada' : 'Mark as Completed'}</span>
            </button>
          )}

          {debt.status === 'rejected' && (
            <div className={styles.rejectedWarning}>
              <span>🎯</span>
              <span>
                {isSpanish 
                  ? 'Has sido marcado como objetivo por rechazar esta deuda' 
                  : 'You have been marked as target for rejecting this debt'}
              </span>
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <RequestPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          debt={debt}
          assassinName={otherAssassinName}
          isSpanish={isSpanish}
          onSubmit={handleRequestPayment}
        />
      )}
    </>
  );
};
