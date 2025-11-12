import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import styles from './Leaderboard.module.css';

interface AssassinStats {
  rank: number;
  name: string;
  email: string;
  contracts: number;
  rating: number;
}

const Leaderboard = () => {
  const [assassins, setAssassins] = useState<AssassinStats[]>([]);
  const [isSpanish, setIsSpanish] = useState(true);

  useEffect(() => {
    // Detectar idioma
    const language = localStorage.getItem('language');
    setIsSpanish(language === 'es' || navigator.language.toLowerCase().startsWith('es'));

    // Obtener todos los asesinos del sistema
    const allAssassins = authService.getAllAssassins();
    
    // Calcular estadísticas para cada asesino
    const assassinStats: AssassinStats[] = allAssassins.map(assassin => {
      const encodedEmail = btoa(assassin.email);
      
      // Obtener todas las misiones
      const publicMissionsStr = localStorage.getItem('publicMissions');
      const publicMissions = publicMissionsStr ? JSON.parse(publicMissionsStr) : [];
      
      const userMissionsStr = localStorage.getItem('userMissions');
      const userMissionsDict = userMissionsStr ? JSON.parse(userMissionsStr) : {};
      
      const allMissions: any[] = [...publicMissions];
      Object.values(userMissionsDict).forEach((missions: any) => {
        if (Array.isArray(missions)) {
          allMissions.push(...missions);
        }
      });
      
      // Contar contratos completados
      const completedMissions = allMissions.filter(
        (m: any) => m.assassinId === encodedEmail && m.terminado
      );
      
      // Calcular rating promedio
      const missionsWithReview = completedMissions.filter((m: any) => m.review && m.review.rating);
      const avgRating = missionsWithReview.length > 0
        ? missionsWithReview.reduce((sum: number, m: any) => sum + m.review.rating, 0) / missionsWithReview.length
        : 0;
      
      return {
        rank: 0, // Se asignará después de ordenar
        name: assassin.nickname || assassin.name || assassin.email.split('@')[0],
        email: assassin.email,
        contracts: completedMissions.length,
        rating: avgRating
      };
    });
    
    // Ordenar por número de contratos (descendente) y luego por rating
    assassinStats.sort((a, b) => {
      if (b.contracts !== a.contracts) {
        return b.contracts - a.contracts;
      }
      return b.rating - a.rating;
    });
    
    // Asignar ranks
    assassinStats.forEach((assassin, index) => {
      assassin.rank = index + 1;
    });
    
    // Tomar solo los top 10
    setAssassins(assassinStats.slice(0, 10));
  }, []);

  return (
    <section className={styles.leaderboard}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              {isSpanish ? 'MEJORES ASESINOS' : 'TOP ASSASSINS'}
            </h1>
            <p className={styles.subtitle}>
              {isSpanish 
                ? 'Los más gloriosos de nuestra orden, elegantes, precisos y eficaces, listos para cualquier petición.'
                : 'The most glorious of our order, elegant, precise and effective, ready for any request.'}
            </p>
          </div>

          <div className={styles.list}>
            {assassins.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🏆</span>
                <p>{isSpanish ? 'No hay asesinos registrados aún' : 'No assassins registered yet'}</p>
              </div>
            ) : (
              assassins.map((assassin) => (
                <div 
                  key={assassin.email} 
                  className={`${styles.item} ${assassin.rank <= 3 ? styles.topThree : ''}`}
                >
                  <div className={styles.rankBadge}>
                    <span className={styles.rankNumber}>{assassin.rank}</span>
                  </div>
                  
                  <div className={styles.info}>
                    <div className={styles.name}>
                      {assassin.name}
                    </div>
                    <div className={styles.rating}>
                      ⭐ {assassin.rating > 0 ? assassin.rating.toFixed(1) : 'N/A'}
                    </div>
                  </div>
                  
                  <div className={styles.contracts}>
                    <span className={styles.contractsNumber}>{assassin.contracts}</span>
                    <span className={styles.contractsLabel}>
                      {isSpanish ? 'CONTRATOS' : 'CONTRACTS'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
  );
};

export default Leaderboard;
