import { useContractor } from './useContractor';
import MissionDetailModal from '../../components/MissionDetailModal';
import styles from './Contractor.module.css';

const Contractor = () => {
  const {
    currentUser,
    contracts,
    selectedContract,
    showReviewModal,
    setShowReviewModal,
    rating,
    setRating,
    hoveredRating,
    setHoveredRating,
    comment,
    setComment,
    showCreateModal,
    setShowCreateModal,
    showReportModal,
    setShowReportModal,
    showDetailModal,
    setShowDetailModal,
    reportDescription,
    setReportDescription,
    missionTitle,
    setMissionTitle,
    missionDescription,
    setMissionDescription,
    missionReward,
    setMissionReward,
    missionLocation,
    setMissionLocation,
    missionDeadline,
    setMissionDeadline,
    isPrivate,
    setIsPrivate,
    targetAssassinId,
    setTargetAssassinId,
    isSpanish,
    handleReviewClick,
    handleSubmitReview,
    handleViewDetails,
    handleReportClick,
    handleSubmitReport,
    handleCreateMission,
    handleAcceptNegotiation,
    handleRejectNegotiation,
    handleCompleteMission
  } = useContractor();

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          {isSpanish ? 'Panel del Contratista' : 'Contractor Panel'}
        </h1>

        {currentUser && (
          <div className={styles.userCard}>
            <div className={styles.avatar}>
              {currentUser.nickname.charAt(0).toUpperCase()}
            </div>
            <h2 className={styles.userName}>{currentUser.nickname}</h2>
          </div>
        )}

        <button 
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          <span className={styles.createIcon}>+</span>
          {isSpanish ? 'PUBLICAR MISIÓN' : 'POST MISSION'}
        </button>

        <section className={styles.missionsSection}>
          <h2 className={styles.sectionTitle}>
            {isSpanish ? 'Mis misiones' : 'My missions'}
          </h2>

          <div className={styles.missionsList}>
            {contracts.map(contract => (
              <div key={contract.id} className={styles.missionCard}>
                <div className={styles.missionInfo}>
                  <h3 className={styles.missionTitle}>{contract.title}</h3>
                  <span className={styles.missionStatus}>
                    {contract.terminado 
                      ? (isSpanish ? 'Completado' : 'Completed')
                      : (isSpanish ? 'En progreso' : 'In progress')}
                  </span>
                </div>

                <div className={styles.missionActions}>
                  {contract.terminado && (
                    <button
                      className={styles.reviewButton}
                      onClick={() => handleReviewClick(contract)}
                    >
                      ⭐ {isSpanish ? 'RESEÑA' : 'REVIEW'}
                    </button>
                  )}
                  <button
                    className={styles.reportButton}
                    onClick={() => handleReportClick(contract)}
                  >
                    ⚠️ {isSpanish ? 'REPORTAR' : 'REPORT'}
                  </button>
                  <button
                    className={styles.detailsButton}
                    onClick={() => handleViewDetails(contract)}
                  >
                    👁️ {isSpanish ? 'DETALLES' : 'DETAILS'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modal de Reseña */}
      {showReviewModal && selectedContract && (
        <div className={styles.modalOverlay} onClick={() => setShowReviewModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowReviewModal(false)}
            >
              ✕
            </button>

            <h2 className={styles.modalTitle}>
              {selectedContract.review 
                ? (isSpanish ? 'Tu Reseña' : 'Your Review')
                : (isSpanish ? 'Calificar Asesino' : 'Rate Assassin')}
            </h2>

            <p className={styles.assassinName}>
              {selectedContract.assassinName || (isSpanish ? 'Asesino' : 'Assassin')}
            </p>

            <div className={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`${styles.star} ${
                    star <= (hoveredRating || rating) ? styles.starActive : ''
                  }`}
                  onClick={() => !selectedContract.review && setRating(star)}
                  onMouseEnter={() => !selectedContract.review && setHoveredRating(star)}
                  onMouseLeave={() => !selectedContract.review && setHoveredRating(0)}
                  disabled={!!selectedContract.review}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              className={styles.textarea}
              placeholder={isSpanish ? 'Escribe tu reseña...' : 'Write your review...'}
              value={comment}
              onChange={(e) => !selectedContract.review && setComment(e.target.value)}
              disabled={!!selectedContract.review}
              rows={5}
            />

            {!selectedContract.review && (
              <button 
                className={styles.submitButton}
                onClick={handleSubmitReview}
              >
                {isSpanish ? 'Enviar Reseña' : 'Submit Review'}
              </button>
            )}

            {selectedContract.review && (
              <p className={styles.reviewDate}>
                {isSpanish ? 'Enviado el' : 'Submitted on'}{' '}
                {new Date(selectedContract.review.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal de Reportar */}
      {showReportModal && selectedContract && currentUser && (
        <div className={styles.modalOverlay} onClick={() => setShowReportModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowReportModal(false)}
            >
              ✕
            </button>

            <h2 className={styles.modalTitle}>
              {isSpanish ? 'Reportar Misión' : 'Report Mission'}
            </h2>

            <div className={styles.reportInfo}>
              <h3 className={styles.reportContractTitle}>{selectedContract.title}</h3>
              <p className={styles.reportHint}>
                {isSpanish
                  ? 'Describe el problema con esta misión. Un administrador revisará tu reporte.'
                  : 'Describe the issue with this mission. An admin will review your report.'}
              </p>
            </div>

            <form className={styles.reportForm} onSubmit={handleSubmitReport}>
              <div className={styles.formGroup}>
                <label htmlFor="reportDescription" className={styles.label}>
                  {isSpanish ? 'Descripción del problema' : 'Issue description'}
                </label>
                <textarea
                  id="reportDescription"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className={styles.textarea}
                  placeholder={isSpanish 
                    ? 'Ej: El asesino no cumplió con los términos acordados...' 
                    : 'Ex: The assassin did not comply with the agreed terms...'}
                  rows={6}
                  required
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                {isSpanish ? 'Enviar Reporte' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Crear Misión */}
      {showCreateModal && currentUser && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowCreateModal(false)}
            >
              ✕
            </button>

            <h2 className={styles.modalTitle}>
              {isSpanish ? 'Crear Nueva Misión' : 'Create New Mission'}
            </h2>

            <div className={styles.coinsInfo}>
              <span className={styles.coinsInfoLabel}>
                {isSpanish ? 'Monedas disponibles:' : 'Available coins:'}
              </span>
              <span className={styles.coinsInfoAmount}>
                🪙 {currentUser.coins.toLocaleString()}
              </span>
            </div>

            <form className={styles.createForm} onSubmit={handleCreateMission}>
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>
                  {isSpanish ? 'Título de la misión' : 'Mission title'}
                </label>
                <input
                  id="title"
                  type="text"
                  value={missionTitle}
                  onChange={(e) => setMissionTitle(e.target.value)}
                  className={styles.input}
                  placeholder={isSpanish ? 'Ej: Eliminar objetivo de alta prioridad' : 'Ex: Eliminate high priority target'}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description" className={styles.label}>
                  {isSpanish ? 'Descripción' : 'Description'}
                </label>
                <textarea
                  id="description"
                  value={missionDescription}
                  onChange={(e) => setMissionDescription(e.target.value)}
                  className={styles.textarea}
                  placeholder={isSpanish ? 'Describe los detalles de la misión...' : 'Describe the mission details...'}
                  rows={4}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="reward" className={styles.label}>
                  {isSpanish ? 'Recompensa (monedas)' : 'Reward (coins)'}
                </label>
                <input
                  id="reward"
                  type="number"
                  value={missionReward}
                  onChange={(e) => setMissionReward(e.target.value)}
                  className={styles.input}
                  placeholder="10000"
                  min="1"
                  max={currentUser.coins}
                  required
                />
                {missionReward && parseInt(missionReward) > currentUser.coins && (
                  <p className={styles.errorText}>
                    {isSpanish 
                      ? '⚠️ No tienes suficientes monedas' 
                      : "⚠️ You don't have enough coins"}
                  </p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="location" className={styles.label}>
                  {isSpanish ? 'Ubicación' : 'Location'}
                </label>
                <input
                  id="location"
                  type="text"
                  value={missionLocation}
                  onChange={(e) => setMissionLocation(e.target.value)}
                  className={styles.input}
                  placeholder={isSpanish ? 'Ej: Bogotá, Colombia' : 'Ex: Bogotá, Colombia'}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="deadline" className={styles.label}>
                  {isSpanish ? 'Fecha límite' : 'Deadline'}
                </label>
                <input
                  id="deadline"
                  type="date"
                  value={missionDeadline}
                  onChange={(e) => setMissionDeadline(e.target.value)}
                  className={styles.input}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className={styles.formSummary}>
                <div className={styles.summaryRow}>
                  <span>{isSpanish ? 'Recompensa:' : 'Reward:'}</span>
                  <span className={styles.summaryValue}>
                    🪙 {missionReward ? parseInt(missionReward).toLocaleString() : '0'}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span>{isSpanish ? 'Saldo restante:' : 'Remaining balance:'}</span>
                  <span className={styles.summaryValue}>
                    🪙 {missionReward 
                      ? (currentUser.coins - parseInt(missionReward || '0')).toLocaleString()
                      : currentUser.coins.toLocaleString()}
                  </span>
                </div>
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={!missionReward || parseInt(missionReward) > currentUser.coins}
              >
                {isSpanish ? 'Crear Misión' : 'Create Mission'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      <MissionDetailModal
        mission={selectedContract}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        currentUser={currentUser}
        isSpanish={isSpanish}
        showNegotiation={true}
        onAcceptNegotiation={handleAcceptNegotiation}
        onRejectNegotiation={handleRejectNegotiation}
        onCompleteMission={handleCompleteMission}
      />
    </div>
  );
};

export default Contractor;
