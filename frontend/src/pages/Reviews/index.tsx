import styles from './Reviews.module.css';

const Reviews = () => {
  const reviews = [
    {
      id: 1,
      text: "Un servicio impecable, cumplen con lo prometido con gran discreción.",
      rating: 5
    },
    {
      id: 2,
      text: "La excelencia en cada detalle, realmente superaron mis expectativas.",
      rating: 5
    },
    {
      id: 3,
      text: "Muy profesionales, transmiten confianza desde el inicio.",
      rating: 4
    },
    {
      id: 4,
      text: "Un nivel de organización impresionante, todo bajo control.",
      rating: 5
    },
    {
      id: 5,
      text: "Seriedad y compromiso, se nota la tradición en cada acción.",
      rating: 4
    },
    {
      id: 6,
      text: "Un trato excepcional, todo se maneja con respeto y eficiencia.",
      rating: 5
    },
    {
      id: 7,
      text: "La atención fue rápida y precisa, sin lugar a dudas confiables.",
      rating: 4
    },
    {
      id: 8,
      text: "Imponentes, mantienen el orden de manera impecable.",
      rating: 5
    },
    {
      id: 9,
      text: "Gran disciplina y claridad en su servicio, muy recomendados.",
      rating: 5
    },
    {
      id: 10,
      text: "Discreción absoluta, se nota que saben lo que hacen.",
      rating: 5
    },
    {
      id: 11,
      text: "Cumplieron con lo acordado de forma puntual y seria.",
      rating: 4
    },
    {
      id: 12,
      text: "Una experiencia que inspira respeto, calidad inigualable.",
      rating: 5
    }
  ];

  const renderStars = (rating) => {
    return (
      <div className={styles.stars}>
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={index < rating ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            className={styles.star}
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        ))}
      </div>
    );
  };

  return (
    <section className={styles.reviews}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>RESEÑAS</h1>
            <p className={styles.subtitle}>
              Aquí podrás encontrar las reseñas y/o comentarios de personas que
              han confiado en nuestros precisos servicios.
            </p>
          </div>

          <div className={styles.grid}>
            {reviews.map((review) => (
              <div key={review.id} className={styles.card}>
                <p className={styles.reviewText}>"{review.text}"</p>
                {renderStars(review.rating)}
              </div>
            ))}
          </div>
        </div>
      </section>
  );
};

export default Reviews;
