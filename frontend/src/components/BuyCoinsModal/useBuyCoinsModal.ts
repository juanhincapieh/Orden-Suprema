import { useState } from 'react';
import { coinsApi } from '../../services/api';

const COIN_PACKAGES = [
  { id: 'pack_500', amount: 500, price: 5 },
  { id: 'pack_1000', amount: 1000, price: 9 },
  { id: 'pack_2500', amount: 2500, price: 20 },
  { id: 'pack_5000', amount: 5000, price: 35 },
  { id: 'pack_10000', amount: 10000, price: 60 }
];

interface UseBuyCoinsModalProps {
  userEmail: string;
  onClose: () => void;
  onPurchaseComplete?: () => void;
}

export const useBuyCoinsModal = ({ userEmail: _userEmail, onClose, onPurchaseComplete }: UseBuyCoinsModalProps) => {
  const [selectedPackage, setSelectedPackage] = useState(COIN_PACKAGES[0]);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isSpanish = navigator.language.toLowerCase().startsWith('es');

  const handleBuyCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Usar el servicio API unificado para comprar monedas
      await coinsApi.purchaseCoins(selectedPackage.amount, selectedPackage.id);

      alert(
        isSpanish
          ? `¡Compra exitosa! Has recibido ${selectedPackage.amount.toLocaleString()} monedas.`
          : `Purchase successful! You received ${selectedPackage.amount.toLocaleString()} coins.`
      );

      setCardNumber('');
      setCardName('');
      setExpiryDate('');
      setCvv('');
      
      onClose();
      
      // Notificar al componente padre para que actualice el estado
      if (onPurchaseComplete) {
        onPurchaseComplete();
      }
    } catch (error) {
      console.error('Error purchasing coins:', error);
      alert(isSpanish ? 'Error al procesar la compra' : 'Error processing purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(formatCardNumber(value));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    if (value.length <= 5) {
      setExpiryDate(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 3 && /^\d*$/.test(value)) {
      setCvv(value);
    }
  };

  return {
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
  };
};
