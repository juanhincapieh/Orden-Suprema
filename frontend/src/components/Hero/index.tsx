import { useNavigate } from "react-router-dom";
import styles from "./Hero.module.css";
const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.hero}>
        <div className={styles.content}>
        <h1 className={styles.title}>LA ORDEN SUPREMA</h1>
        
        <div className={styles.actions}>
          <button className={styles.actionButton} onClick={() => navigate('/aboutus')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={styles.icon}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            CONOCE LA ORDEN
          </button>
          
          <button className={styles.actionButton} onClick={() => navigate('/assassins')}>
            CONTRATA A UN ASESINO
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={styles.icon}>
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </button>
        </div>

        <div className={styles.emblem}>
          <div className={styles.emblemOuter}>
            <div className={styles.emblemInner}>
              <div className={styles.emblemText}>
                ACTIONES SECUNDUM FIDEM
              </div>
              <div className={styles.emblemCenter}>
                <svg viewBox="0 0 100 100" className={styles.emblemIcon}>
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M50 20 L60 45 L50 40 L40 45 Z" fill="currentColor"/>
                  <circle cx="50" cy="50" r="8" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;