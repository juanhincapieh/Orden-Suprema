import styles from './AboutUs.module.css';

const AboutUs = () => {
  return (
    <section className={styles.aboutUs}>
        <div className={styles.container}>
          <div className={styles.emblemContainer}>
            <div className={styles.emblemGlow}>
              <div className={styles.emblem}>
                <div className={styles.emblemOuter}>
                  <div className={styles.emblemMiddle}>
                    <div className={styles.emblemInner}>
                      <svg viewBox="0 0 100 100" className={styles.emblemIcon}>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1"/>
                        <path d="M50 20 L55 40 L50 37 L45 40 Z" fill="currentColor"/>
                        <circle cx="50" cy="50" r="6" fill="currentColor"/>
                        <path d="M30 65 Q50 75 70 65" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.content}>
            <h1 className={styles.title}>SOBRE LA ORDEN SUPREMA</h1>
            <p className={styles.description}>
              La Orden Suprema es una organización internacional dedicada a mantener el equilibrio, 
              la disciplina y el cumplimiento de códigos que garantizan la estabilidad en un mundo 
              de constantes desafíos. Actuamos con discreción, eficiencia y respeto por la tradición, 
              asegurando que cada acción se realice con integridad. Nuestro compromiso es preservar 
              el orden y la confianza en un sistema que trasciende fronteras.
            </p>
          </div>
        </div>
      </section>
  );
};

export default AboutUs;
