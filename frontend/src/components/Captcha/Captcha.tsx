import { useState, useEffect, useRef } from 'react';
import styles from './Captcha.module.css';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  isSpanish?: boolean;
}

export const Captcha = ({ onVerify, isSpanish = false }: CaptchaProps) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCaptcha = () => {
    // Generar texto aleatorio de 6 caracteres
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let text = '';
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    setUserInput('');
    setIsVerified(false);
    onVerify(false);
    return text;
  };

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo con gradiente
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1e1e1e');
    gradient.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Líneas de ruido
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(212, 175, 55, ${Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Puntos de ruido
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(212, 175, 55, ${Math.random() * 0.5})`;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        2,
        2
      );
    }

    // Dibujar texto con distorsión
    ctx.font = 'bold 32px Arial';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const x = 20 + i * 30;
      const y = canvas.height / 2;
      
      // Rotación aleatoria
      const angle = (Math.random() - 0.5) * 0.4;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      
      // Color con variación
      const hue = Math.random() * 60 + 30; // Tonos dorados
      ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
      ctx.strokeStyle = `hsl(${hue}, 70%, 40%)`;
      ctx.lineWidth = 1;
      
      ctx.fillText(char, 0, 0);
      ctx.strokeText(char, 0, 0);
      
      ctx.restore();
    }
  };

  useEffect(() => {
    const text = generateCaptcha();
    drawCaptcha(text);
  }, []);

  const handleRefresh = () => {
    const text = generateCaptcha();
    drawCaptcha(text);
  };

  const handleVerify = () => {
    const isValid = userInput.toLowerCase() === captchaText.toLowerCase();
    setIsVerified(isValid);
    onVerify(isValid);
    
    if (!isValid) {
      // Si es incorrecto, generar nuevo captcha
      setTimeout(() => {
        const text = generateCaptcha();
        drawCaptcha(text);
      }, 1000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    if (isVerified) {
      setIsVerified(false);
      onVerify(false);
    }
  };

  return (
    <div className={styles.captchaContainer}>
      <div className={styles.captchaHeader}>
        <span className={styles.captchaIcon}>🔒</span>
        <span className={styles.captchaTitle}>
          {isSpanish ? 'Verificación de seguridad' : 'Security Verification'}
        </span>
      </div>

      <div className={styles.captchaContent}>
        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            width={200}
            height={60}
            className={styles.canvas}
          />
          <button
            type="button"
            className={styles.refreshButton}
            onClick={handleRefresh}
            title={isSpanish ? 'Generar nuevo código' : 'Generate new code'}
          >
            🔄
          </button>
        </div>

        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder={isSpanish ? 'Ingresa el código' : 'Enter the code'}
            className={`${styles.input} ${
              isVerified ? styles.inputSuccess : userInput && !isVerified ? styles.inputError : ''
            }`}
            maxLength={6}
          />
          <button
            type="button"
            className={styles.verifyButton}
            onClick={handleVerify}
            disabled={userInput.length !== 6}
          >
            {isVerified ? '✓' : isSpanish ? 'Verificar' : 'Verify'}
          </button>
        </div>

        {isVerified && (
          <div className={styles.successMessage}>
            <span className={styles.successIcon}>✓</span>
            <span>{isSpanish ? 'Verificación exitosa' : 'Verification successful'}</span>
          </div>
        )}

        {userInput && !isVerified && userInput.length === 6 && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>✗</span>
            <span>{isSpanish ? 'Código incorrecto' : 'Incorrect code'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
