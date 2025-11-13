import { useBuyCoinsModal } from './useBuyCoinsModal';
import styles from './BuyCoinsModal.module.css';

interface BuyCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  currentCoins: number;
  onPurchaseComplete?: () => void;
}

const BuyCoinsModal = ({ isOpen, onClose, userEmail, onPurchaseComplete }: BuyCoinsModalProps) => {
  const {
    COIN_PACKAGES,
    selectedPackage,
    setSelectedPackage,
    cardNumber,
    cardName,
    setCardName,
    expiryDate,
    cvv,
    isSpanish,
    handleBuyCoins,
    handleCardNumberChange,
    handleExpiryChange,
    handleCvvChange
  } = useBuyCoinsModal({ userEmail, onClose, onPurchaseComplete });

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <h2 className={styles.modalTitle}>
          {isSpanish ? 'Comprar Monedas' : 'Buy Coins'}
        </h2>

        <div className={styles.packagesGrid}>
          {COIN_PACKAGES.map((pkg) => (
            <button
              key={pkg.amount}
              type="button"
              className={`${styles.packageCard} ${
                selectedPackage.amount === pkg.amount ? styles.packageActive : ''
              }`}
              onClick={() => setSelectedPackage(pkg)}
            >
              <span className={styles.packageIcon}>🪙</span>
              <span className={styles.packageAmount}>{pkg.amount.toLocaleString()}</span>
              <span className={styles.packagePrice}>${pkg.price}</span>
            </button>
          ))}
        </div>

        <form className={styles.paymentForm} onSubmit={handleBuyCoins}>
          <div className={styles.formGroup}>
            <label htmlFor="cardNumber" className={styles.label}>
              {isSpanish ? 'Número de tarjeta' : 'Card number'}
            </label>
            <input
              id="cardNumber"
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cardName" className={styles.label}>
              {isSpanish ? 'Nombre en la tarjeta' : 'Cardholder name'}
            </label>
            <input
              id="cardName"
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="John Doe"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="expiryDate" className={styles.label}>
                {isSpanish ? 'Fecha de expiración' : 'Expiry date'}
              </label>
              <input
                id="expiryDate"
                type="text"
                value={expiryDate}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="cvv" className={styles.label}>
                CVV
              </label>
              <input
                id="cvv"
                type="text"
                value={cvv}
                onChange={handleCvvChange}
                placeholder="123"
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.totalSection}>
            <span className={styles.totalLabel}>Total:</span>
            <span className={styles.totalAmount}>${selectedPackage.price}</span>
          </div>

          <button type="submit" className={styles.buyButton}>
            {isSpanish ? 'Comprar Ahora' : 'Buy Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BuyCoinsModal;
