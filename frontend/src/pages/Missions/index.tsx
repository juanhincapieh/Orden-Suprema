import { useNavigate } from 'react-router-dom';
import { useMissions } from './useMissions';
import MissionDetailModal from '../../components/MissionDetailModal';
import styles from './Missions.module.css';

const Missions = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    filteredMissions,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    selectedMission,
    showDetailModal,
    setShowDetailModal,
    showNegotiateModal,
    setShowNegotiateModal,
    showSuccessModal,
    setShowSuccessModal,
    showAuthModal,
    setShowAuthModal,
    acceptedMission,
    proposedReward,
    setProposedReward,
    negotiationMessage,
    setNegotiationMessage,
    handleViewDetails,
    handleNegotiateClick,
    handleSubmitNegotiation,
    handleAcceptMission,
    handleAcceptCurrentTerms,
    getStatusColor,
    getStatusText,
    isSpanish
  } = useMissions();

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          {isSpanish ? 'MISIONES PÚBLICAS' : 'PUBLIC MISSIONS'}
        </h1>

        <p className={styles.subtitle}>
          {isSpanish
            ? 'Explora contratos disponibles y negocia las mejores condiciones'
            : 'Explore available contracts and negotiate the best terms'}
        </p>

        {/* Filtros y búsqueda */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder={isSpanish ? 'Buscar misiones...' : 'Search missions...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filters}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={styles.select}
            >
              <option value="all">{isSpanish ? 'Todos los estados' : 'All statuses'}</option>
              <option value="open">{isSpanish ? 'Abiertas' : 'Open'}</option>
              <option value="negotiating">{isSpanish ? 'En negociación' : 'Negotiating'}</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={styles.select}
            >
              <option value="recent">{isSpanish ? 'Más recientes' : 'Most recent'}</option>
              <option value="reward">{isSpanish ? 'Mayor recompensa' : 'Highest reward'}</option>
              <option value="deadline">{isSpanish ? 'Fecha límite' : 'Deadline'}</option>
            </select>
          </div>
        </div>

        {/* Lista de misiones */}
        <div className={styles.missionsGrid}>
          {filteredMissions.map((mission) => (
            <div key={mission.id} className={styles.missionCard}>
              <div className={styles.cardHeader}>
                <div
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(mission.status) }}
                >
                  {getStatusText(mission.status)}
                </div>
                <span className={styles.reward}>
                  🪙 {mission.reward.toLocaleString()}
                </span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.missionTitle}>{mission.title}</h3>
                <p className={styles.missionDescription}>{mission.description}</p>

                <div className={styles.missionMeta}>
                  {mission.location && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>📍</span>
                      <span className={styles.metaText}>{mission.location}</span>
                    </div>
                  )}
                  {mission.deadline && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>⏰</span>
                      <span className={styles.metaText}>
                        {new Date(mission.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className={styles.metaItem}>
                    <span className={styles.metaIcon}>📅</span>
                    <span className={styles.metaText}>
                      {new Date(mission.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {mission.negotiation && mission.negotiation.status === 'pending' && (
                  <div className={styles.negotiationBanner}>
                    <span className={styles.negotiationIcon}>💬</span>
                    <span className={styles.negotiationText}>
                      {isSpanish ? 'Negociación pendiente' : 'Negotiation pending'}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.cardActions}>
                <button
                  className={styles.detailsButton}
                  onClick={() => handleViewDetails(mission)}
                >
                  {isSpanish ? 'Ver detalles' : 'View details'}
                </button>
                {mission.status === 'open' && (
                  <>
                    {(!currentUser || currentUser.role === 'assassin') && (
                      <button
                        className={styles.acceptButton}
                        onClick={() => handleAcceptMission(mission)}
                      >
                        {isSpanish ? 'Aceptar' : 'Accept'}
                      </button>
                    )}
                    <button
                      className={styles.negotiateButton}
                      onClick={() => handleNegotiateClick(mission)}
                    >
                      {isSpanish ? 'Negociar' : 'Negotiate'}
                    </button>
                  </>
                )}
                {mission.status === 'negotiating' && (
                  <button
                    className={styles.negotiateButton}
                    onClick={() => handleNegotiateClick(mission)}
                  >
                    {isSpanish ? 'Enviar propuesta' : 'Send proposal'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredMissions.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📋</span>
            <p>{isSpanish ? 'No hay misiones disponibles' : 'No missions available'}</p>
          </div>
        )}
      </main>

      {/* Modal de detalles */}
      <MissionDetailModal
        mission={selectedMission}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        currentUser={currentUser}
        isSpanish={isSpanish}
        showNegotiation={true}
      />

      {/* Botón de negociación en modal */}
      {showDetailModal && selectedMission && currentUser && selectedMission.status === 'open' && (
        <div className={styles.modalOverlay} style={{ pointerEvents: 'none' }}>
          <div className={styles.modal} style={{ pointerEvents: 'auto' }}>
            <button
              className={styles.modalNegotiateButton}
              onClick={() => {
                setShowDetailModal(false);
                handleNegotiateClick(selectedMission);
              }}
            >
              {isSpanish ? 'Iniciar negociación' : 'Start negotiation'}
            </button>
          </div>
        </div>
      )}

      {/* Modal de negociación */}
      {showNegotiateModal && selectedMission && currentUser && (
        <div className={styles.modalOverlay} onClick={() => setShowNegotiateModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowNegotiateModal(false)}>
              ✕
            </button>

            <h2 className={styles.modalTitle}>
              {selectedMission.status === 'negotiating'
                ? (isSpanish ? 'Enviar Propuesta' : 'Send Proposal')
                : (isSpanish ? 'Negociar Misión' : 'Negotiate Mission')}
            </h2>

            <div className={styles.negotiateInfo}>
              <h3 className={styles.negotiateTitle}>{selectedMission.title}</h3>
              <p className={styles.negotiateOriginal}>
                {isSpanish ? 'Recompensa actual:' : 'Current reward:'}{' '}
                <span className={styles.negotiateAmount}>
                  🪙 {selectedMission.reward.toLocaleString()}
                </span>
              </p>
            </div>

            {selectedMission.status === 'negotiating' && selectedMission.negotiation && currentUser && selectedMission.contractorId === currentUser.id && (
              <div className={styles.currentNegotiation}>
                <h4 className={styles.currentNegotiationTitle}>
                  {isSpanish ? 'Negociación activa:' : 'Active negotiation:'}
                </h4>
                <div className={styles.currentNegotiationBox}>
                  <p className={styles.currentNegotiationProposer}>
                    <strong>{selectedMission.negotiation.proposedByName}</strong>{' '}
                    {isSpanish ? 'propone' : 'proposes'}:{' '}
                    <span className={styles.currentNegotiationReward}>
                      🪙 {selectedMission.negotiation.proposedReward.toLocaleString()}
                    </span>
                  </p>
                  {selectedMission.negotiation.message && (
                    <p className={styles.currentNegotiationMessage}>
                      "{selectedMission.negotiation.message}"
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {selectedMission.status === 'negotiating' && selectedMission.negotiation && (!currentUser || selectedMission.contractorId !== currentUser.id) && (
              <div className={styles.currentNegotiation}>
                <h4 className={styles.currentNegotiationTitle}>
                  {isSpanish ? 'Negociación activa' : 'Active negotiation'}
                </h4>
                <div className={styles.currentNegotiationBox}>
                  <p className={styles.negotiationInfo}>
                    {isSpanish
                      ? '🔒 Esta misión está en negociación. Los detalles son confidenciales por seguridad.'
                      : '🔒 This mission is under negotiation. Details are confidential for security.'}
                  </p>
                </div>
              </div>
            )}

            {selectedMission.status === 'negotiating' && currentUser.role === 'assassin' && (
              <div className={styles.negotiateOptions}>
                <button
                  type="button"
                  className={styles.acceptTermsButton}
                  onClick={() => handleAcceptCurrentTerms(selectedMission)}
                >
                  <span className={styles.optionIcon}>✅</span>
                  <div className={styles.optionText}>
                    <strong>
                      {isSpanish ? 'Aceptar términos actuales' : 'Accept current terms'}
                    </strong>
                    <span className={styles.optionSubtext}>
                      {isSpanish
                        ? 'Acepto la misión con la recompensa actual'
                        : 'I accept the mission with the current reward'}
                    </span>
                  </div>
                </button>

                <div className={styles.orDivider}>
                  <span>{isSpanish ? 'O' : 'OR'}</span>
                </div>
              </div>
            )}

            <form className={styles.negotiateForm} onSubmit={handleSubmitNegotiation}>
              <div className={styles.formGroup}>
                <label htmlFor="proposedReward" className={styles.label}>
                  {selectedMission.status === 'negotiating'
                    ? (isSpanish ? 'Nueva propuesta de recompensa' : 'New reward proposal')
                    : (isSpanish ? 'Recompensa propuesta' : 'Proposed reward')}
                </label>
                <input
                  id="proposedReward"
                  type="number"
                  value={proposedReward}
                  onChange={(e) => setProposedReward(e.target.value)}
                  className={styles.input}
                  min="1"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>
                  {isSpanish ? 'Mensaje (opcional)' : 'Message (optional)'}
                </label>
                <textarea
                  id="message"
                  value={negotiationMessage}
                  onChange={(e) => setNegotiationMessage(e.target.value)}
                  className={styles.textarea}
                  placeholder={
                    isSpanish
                      ? 'Explica tu propuesta...'
                      : 'Explain your proposal...'
                  }
                  rows={4}
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                {isSpanish ? 'Enviar nueva propuesta' : 'Send new proposal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {showSuccessModal && acceptedMission && (
        <div className={styles.modalOverlay} onClick={() => setShowSuccessModal(false)}>
          <div className={styles.successModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowSuccessModal(false)}>
              ✕
            </button>

            <div className={styles.successIcon}>🎉</div>

            <h2 className={styles.successTitle}>
              {isSpanish ? '¡Felicitaciones!' : 'Congratulations!'}
            </h2>

            <p className={styles.successMessage}>
              {isSpanish
                ? 'Has obtenido la misión exitosamente'
                : 'You have successfully obtained the mission'}
            </p>

            <div className={styles.successMissionInfo}>
              <h3 className={styles.successMissionTitle}>{acceptedMission.title}</h3>
              <div className={styles.successReward}>
                <span className={styles.successRewardLabel}>
                  {isSpanish ? 'Recompensa:' : 'Reward:'}
                </span>
                <span className={styles.successRewardAmount}>
                  🪙 {acceptedMission.reward.toLocaleString()}
                </span>
              </div>
            </div>

            {acceptedMission.deadline && (
              <div className={styles.successDeadline}>
                <span className={styles.deadlineIcon}>⏰</span>
                <div className={styles.deadlineInfo}>
                  <p className={styles.deadlineLabel}>
                    {isSpanish ? 'Tienes hasta el' : 'You have until'}
                  </p>
                  <p className={styles.deadlineDate}>
                    {new Date(acceptedMission.deadline).toLocaleDateString(
                      isSpanish ? 'es-ES' : 'en-US',
                      { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }
                    )}
                  </p>
                  <p className={styles.deadlineSubtext}>
                    {isSpanish ? 'para cumplir la misión' : 'to complete the mission'}
                  </p>
                </div>
              </div>
            )}

            <button
              className={styles.successButton}
              onClick={() => {
                setShowSuccessModal(false);
              }}
            >
              {isSpanish ? 'Entendido' : 'Got it'}
            </button>
          </div>
        </div>
      )}

      {/* Modal de autenticación requerida */}
      {showAuthModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAuthModal(false)}>
          <div className={styles.authModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowAuthModal(false)}>
              ✕
            </button>

            <div className={styles.authIcon}>🔐</div>

            <h2 className={styles.authTitle}>
              {isSpanish ? 'Autenticación Requerida' : 'Authentication Required'}
            </h2>

            <p className={styles.authMessage}>
              {isSpanish
                ? 'Para acceder a esta función debes:'
                : 'To access this feature you must:'}
            </p>

            <div className={styles.authButtons}>
              <button
                className={styles.authLoginButton}
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/login');
                }}
              >
                <span className={styles.authButtonIcon}>🔑</span>
                {isSpanish ? 'Iniciar Sesión' : 'Log In'}
              </button>

              <button
                className={styles.authRegisterButton}
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/register');
                }}
              >
                <span className={styles.authButtonIcon}>✨</span>
                {isSpanish ? 'Registrarse' : 'Sign Up'}
              </button>
            </div>

            <p className={styles.authNote}>
              {isSpanish
                ? '💡 Crea una cuenta para aceptar misiones y ganar recompensas'
                : '💡 Create an account to accept missions and earn rewards'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Missions;
