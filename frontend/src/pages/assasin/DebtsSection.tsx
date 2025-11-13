import { useState } from 'react';
import { Debt } from '../../services/debtService';
import { DebtCard } from './DebtCard';
import styles from './DebtsSection.module.css';

interface User {
  email: string;
  role: string;
  name?: string;
  nickname?: string;
}

interface DebtsSectionProps {
  debtsIOwe: Debt[];
  debtsOwedToMe: Debt[];
  currentUser: User;
  isSpanish: boolean;
  onRequestPayment: (debtId: string, description: string) => void;
  onMarkCompleted: (debtId: string) => void;
  getAssassinName: (assassinId: string) => string;
  onRefresh: () => void;
}

export const DebtsSection = ({
  debtsIOwe,
  debtsOwedToMe,
  currentUser,
  isSpanish,
  onRequestPayment,
  onMarkCompleted,
  getAssassinName,
  onRefresh
}: DebtsSectionProps) => {
  const [activeTab, setActiveTab] = useState<'owe' | 'owed'>('owe');

  const totalDebts = debtsIOwe.length + debtsOwedToMe.length;

  if (totalDebts === 0) {
    return (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          💰 {isSpanish ? 'MIS DEUDAS' : 'MY DEBTS'}
        </h2>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✨</div>
          <p>{isSpanish ? 'No tienes deudas activas' : 'You have no active debts'}</p>
          <p className={styles.emptySubtext}>
            {isSpanish 
              ? 'Las deudas aparecerán aquí cuando solicites o aceptes favores' 
              : 'Debts will appear here when you request or accept favors'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>
        💰 {isSpanish ? 'MIS DEUDAS' : 'MY DEBTS'}
      </h2>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'owe' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('owe')}
        >
          <span className={styles.tabIcon}>📤</span>
          <span className={styles.tabLabel}>
            {isSpanish ? 'Deudas que Debo' : 'Debts I Owe'}
          </span>
          <span className={styles.tabCount}>({debtsIOwe.length})</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'owed' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('owed')}
        >
          <span className={styles.tabIcon}>📥</span>
          <span className={styles.tabLabel}>
            {isSpanish ? 'Deudas que me Deben' : 'Debts Owed to Me'}
          </span>
          <span className={styles.tabCount}>({debtsOwedToMe.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'owe' ? (
          debtsIOwe.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>✅</div>
              <p>{isSpanish ? 'No debes ningún favor' : 'You owe no favors'}</p>
            </div>
          ) : (
            <div className={styles.debtsList}>
              {debtsIOwe.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  type="owed"
                  currentUser={currentUser}
                  isSpanish={isSpanish}
                  onMarkCompleted={() => onMarkCompleted(debt.id)}
                  getAssassinName={getAssassinName}
                  onRefresh={onRefresh}
                />
              ))}
            </div>
          )
        ) : (
          debtsOwedToMe.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <p>{isSpanish ? 'Nadie te debe favores' : 'No one owes you favors'}</p>
            </div>
          ) : (
            <div className={styles.debtsList}>
              {debtsOwedToMe.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  type="owing"
                  currentUser={currentUser}
                  isSpanish={isSpanish}
                  onRequestPayment={(description: string) => onRequestPayment(debt.id, description)}
                  getAssassinName={getAssassinName}
                  onRefresh={onRefresh}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
