import { useState } from 'react';
import { AssassinProfile } from './useAssassins';
import { RequestFavorModal } from './RequestFavorModal';
import styles from './Assassins.module.css';

interface User {
  email: string;
  role: string;
  name?: string;
  nickname?: string;
}

interface RequestFavorButtonProps {
  targetAssassin: AssassinProfile;
  currentUser: User | null;
  isSpanish: boolean;
  onRequestSent: () => void;
}

export const RequestFavorButton = ({
  targetAssassin,
  currentUser,
  isSpanish,
  onRequestSent
}: RequestFavorButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  // Solo mostrar si el usuario es asesino
  if (!currentUser || currentUser.role !== 'assassin') {
    return null;
  }

  const handleClick = () => {
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleSuccess = () => {
    setShowModal(false);
    onRequestSent();
  };

  return (
    <>
      <button
        className={styles.requestFavorButton}
        onClick={handleClick}
        title={isSpanish ? 'Solicitar un favor a este asesino' : 'Request a favor from this assassin'}
      >
        <span className={styles.requestFavorIcon}>🤝</span>
        <span>{isSpanish ? 'Pedir Favor' : 'Request Favor'}</span>
      </button>

      {showModal && (
        <RequestFavorModal
          isOpen={showModal}
          onClose={handleClose}
          targetAssassin={targetAssassin}
          currentUser={currentUser}
          isSpanish={isSpanish}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};
