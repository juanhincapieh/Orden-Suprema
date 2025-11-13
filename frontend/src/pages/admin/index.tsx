import { useAdmin } from './useAdmin';
import { AssassinMap } from '../../components/AssassinMap';
import styles from './Admin.module.css';

const Admin = () => {
  const {
    activeTab,
    setActiveTab,
    assassins,
    contracts,
    transactions,
    reports,
    selectedContract,
    setSelectedContract,
    selectedAssassin,
    setSelectedAssassin,
    showAssignModal,
    setShowAssignModal,
    selectedAssassinOnMap,
    setSelectedAssassinOnMap,
    newMissionTitle,
    setNewMissionTitle,
    newMissionDescription,
    setNewMissionDescription,
    newMissionReward,
    setNewMissionReward,
    newMissionLocation,
    setNewMissionLocation,
    newMissionDeadline,
    setNewMissionDeadline,
    isSpanish,
    handleAssignContract,
    handlePenalizeReport,
    handleCancelReport,
    handleSuspendAssassin,
    handleDeleteAssassin,
    getStatusColor,
    getStatusText,
    loadTransactions
  } = useAdmin();

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          {isSpanish ? 'Panel del Administrador' : 'Admin Panel'}
        </h1>

        <div className={styles.tabButtons}>
          <button
            className={`${styles.tabButton} ${activeTab === 'assign' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('assign')}
          >
            <span className={styles.tabIcon}>➕</span>
            {isSpanish ? 'ASIGNAR MISIÓN' : 'ASSIGN MISSION'}
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'manage' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <span className={styles.tabIcon}>📋</span>
            {isSpanish ? 'GESTIONAR ASESINOS' : 'MANAGE ASSASSINS'}
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'transactions' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <span className={styles.tabIcon}>👁️</span>
            {isSpanish ? 'VER TRANSACCIONES' : 'VIEW TRANSACTIONS'}
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'reports' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <span className={styles.tabIcon}>⚠️</span>
            {isSpanish ? 'REPORTES' : 'REPORTS'}
            {reports.filter(r => r.status === 'pending').length > 0 && (
              <span className={styles.tabBadge}>
                {reports.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Tab: Asignar Misión */}
        {activeTab === 'assign' && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {isSpanish ? 'Mapa de asesinos' : 'Assassins Map'}
            </h2>

            <div className={styles.mapContainer}>
              <div className={styles.assassinsList}>
                {assassins.map((assassin) => (
                  <div 
                    key={assassin.id} 
                    className={`${styles.assassinCard} ${selectedAssassinOnMap === assassin.id ? styles.assassinCardSelected : ''}`}
                    onClick={() => setSelectedAssassinOnMap(assassin.id)}
                  >
                    <div className={styles.assassinAvatar}>
                      {assassin.name.charAt(0)}
                    </div>
                    <div className={styles.assassinInfo}>
                      <h3 className={styles.assassinName}>{assassin.name}</h3>
                      <div className={styles.assassinStats}>
                        <span>⭐ {assassin.rating.toFixed(1)}</span>
                        <span>✓ {assassin.completedContracts}</span>
                      </div>
                    </div>
                    <div
                      className={styles.assassinStatus}
                      style={{ backgroundColor: getStatusColor(assassin.status) }}
                    >
                      {getStatusText(assassin.status)}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.mapWrapper}>
                <AssassinMap 
                  assassins={assassins}
                  selectedAssassinId={selectedAssassinOnMap}
                  onAssassinClick={setSelectedAssassinOnMap}
                  isSpanish={isSpanish}
                />
              </div>
            </div>

            <div className={styles.contractsList}>
              <div className={styles.contractsHeader}>
                <h3 className={styles.subsectionTitle}>
                  {isSpanish ? 'Contratos disponibles' : 'Available Contracts'}
                </h3>
                <button
                  className={styles.createMissionButton}
                  onClick={() => {
                    setSelectedContract(null);
                    setShowAssignModal(true);
                  }}
                >
                  <span>✨</span>
                  <span>{isSpanish ? 'Crear Nueva Misión' : 'Create New Mission'}</span>
                </button>
              </div>
              {contracts.map((contract) => (
                <div key={contract.id} className={styles.contractCard}>
                  <div className={styles.contractInfo}>
                    <h4 className={styles.contractTitle}>{contract.title}</h4>
                    <p className={styles.contractReward}>
                      💰 {contract.reward.toLocaleString()} {isSpanish ? 'monedas' : 'coins'}
                    </p>
                  </div>
                  <button
                    className={styles.assignButton}
                    onClick={() => {
                      setSelectedContract(contract);
                      setShowAssignModal(true);
                    }}
                  >
                    {isSpanish ? 'Asignar' : 'Assign'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab: Gestionar Asesinos */}
        {activeTab === 'manage' && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {isSpanish ? 'Lista de asesinos' : 'Assassins List'}
            </h2>

            <div className={styles.assassinsGrid}>
              {assassins.map((assassin) => (
                <div key={assassin.id} className={styles.assassinDetailCard}>
                  <div className={styles.assassinHeader}>
                    <div className={styles.assassinAvatarLarge}>
                      {assassin.name.charAt(0)}
                    </div>
                    <div
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(assassin.status) }}
                    >
                      {getStatusText(assassin.status)}
                    </div>
                  </div>

                  <h3 className={styles.assassinNameLarge}>{assassin.name}</h3>
                  <p className={styles.assassinEmail}>{assassin.email}</p>

                  <div className={styles.assassinMetrics}>
                    <div className={styles.metric}>
                      <span className={styles.metricLabel}>
                        {isSpanish ? 'Calificación' : 'Rating'}
                      </span>
                      <span className={styles.metricValue}>⭐ {assassin.rating.toFixed(1)}</span>
                    </div>
                    <div className={styles.metric}>
                      <span className={styles.metricLabel}>
                        {isSpanish ? 'Completados' : 'Completed'}
                      </span>
                      <span className={styles.metricValue}>{assassin.completedContracts}</span>
                    </div>
                  </div>

                  <div className={styles.manageActions}>
                    <button 
                      className={styles.suspendButton}
                      onClick={() => handleSuspendAssassin(assassin.email)}
                      title={isSpanish ? 'Suspender cuenta' : 'Suspend account'}
                    >
                      🚫 {isSpanish ? 'Suspender' : 'Suspend'}
                    </button>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDeleteAssassin(assassin.email)}
                      title={isSpanish ? 'Eliminar cuenta' : 'Delete account'}
                    >
                      🗑️ {isSpanish ? 'Eliminar' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab: Ver Transacciones */}
        {activeTab === 'transactions' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {isSpanish ? 'Historial de transacciones' : 'Transaction History'}
              </h2>
              <button 
                className={styles.refreshButton}
                onClick={loadTransactions}
                title={isSpanish ? 'Actualizar transacciones' : 'Refresh transactions'}
              >
                🔄 {isSpanish ? 'Actualizar' : 'Refresh'}
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>💰</span>
                <p>{isSpanish ? 'No hay transacciones registradas' : 'No transactions recorded'}</p>
              </div>
            ) : (
              <div className={styles.transactionsList}>
                {transactions.map((transaction) => (
                <div key={transaction.id} className={styles.transactionCard}>
                  <div className={styles.transactionIcon}>
                    {transaction.type === 'purchase' && '🛒'}
                    {transaction.type === 'payment' && '💸'}
                    {transaction.type === 'reward' && '🎁'}
                  </div>

                  <div className={styles.transactionInfo}>
                    <h4 className={styles.transactionUser}>{transaction.userName}</h4>
                    <p className={styles.transactionDescription}>{transaction.description}</p>
                    <p className={styles.transactionDate}>
                      {transaction.date.toLocaleDateString()}
                    </p>
                  </div>

                  <div
                    className={`${styles.transactionAmount} ${
                      transaction.amount > 0 ? styles.positive : styles.negative
                    }`}
                  >
                    {transaction.amount > 0 ? '+' : ''}
                    {transaction.amount.toLocaleString()} 🪙
                  </div>
                </div>
              ))}
              </div>
            )}
          </section>
        )}

        {/* Tab: Reportes */}
        {activeTab === 'reports' && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {isSpanish ? 'Reportes de Misiones' : 'Mission Reports'}
            </h2>

            {reports.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📋</span>
                <p>{isSpanish ? 'No hay reportes' : 'No reports'}</p>
              </div>
            ) : (
              <div className={styles.reportsList}>
                {reports.map((report) => (
                  <div key={report.id} className={styles.reportCard}>
                    <div className={styles.reportHeader}>
                      <div className={styles.reportStatus} data-status={report.status}>
                        {report.status === 'pending' && '⏳'}
                        {report.status === 'resolved' && '✅'}
                        {report.status === 'cancelled' && '❌'}
                        <span>
                          {report.status === 'pending' && (isSpanish ? 'Pendiente' : 'Pending')}
                          {report.status === 'resolved' && (isSpanish ? 'Resuelto' : 'Resolved')}
                          {report.status === 'cancelled' && (isSpanish ? 'Cancelado' : 'Cancelled')}
                        </span>
                      </div>
                      <span className={styles.reportDate}>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className={styles.reportContractTitle}>{report.contractTitle}</h3>
                    
                    <div className={styles.reportInfo}>
                      <p className={styles.reportReporter}>
                        <strong>{isSpanish ? 'Reportado por:' : 'Reported by:'}</strong> {report.reporterName}
                      </p>
                      <p className={styles.reportDescription}>{report.description}</p>
                    </div>

                    {report.status === 'pending' && (
                      <div className={styles.reportActions}>
                        <button
                          className={styles.penalizeButton}
                          onClick={() => handlePenalizeReport(report.id)}
                        >
                          ⚠️ {isSpanish ? 'Penalizar' : 'Penalize'}
                        </button>
                        <button
                          className={styles.cancelReportButton}
                          onClick={() => handleCancelReport(report.id)}
                        >
                          ❌ {isSpanish ? 'Cancelar Reporte' : 'Cancel Report'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Modal de Asignación */}
      {showAssignModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAssignModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowAssignModal(false)}>
              ✕
            </button>

            <h2 className={styles.modalTitle}>
              {selectedContract 
                ? (isSpanish ? 'Asignar Contrato' : 'Assign Contract')
                : (isSpanish ? 'Crear y Asignar Misión' : 'Create and Assign Mission')}
            </h2>

            <div className={styles.modalContent}>
              {selectedContract ? (
                <div className={styles.contractDetails}>
                  <h3>{selectedContract.title}</h3>
                  <p>{selectedContract.description}</p>
                  <p className={styles.rewardText}>
                    💰 {selectedContract.reward.toLocaleString()} {isSpanish ? 'monedas' : 'coins'}
                  </p>
                </div>
              ) : (
                <div className={styles.newMissionForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      {isSpanish ? 'Título de la misión' : 'Mission title'}
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder={isSpanish ? 'Ej: Eliminar objetivo de alta prioridad' : 'Ex: Eliminate high priority target'}
                      value={newMissionTitle}
                      onChange={(e) => setNewMissionTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      {isSpanish ? 'Descripción' : 'Description'}
                    </label>
                    <textarea
                      className={styles.textarea}
                      rows={4}
                      placeholder={isSpanish ? 'Describe los detalles de la misión...' : 'Describe the mission details...'}
                      value={newMissionDescription}
                      onChange={(e) => setNewMissionDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        {isSpanish ? 'Recompensa (monedas)' : 'Reward (coins)'}
                      </label>
                      <input
                        type="number"
                        className={styles.input}
                        placeholder="50000"
                        min="0"
                        value={newMissionReward}
                        onChange={(e) => setNewMissionReward(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        {isSpanish ? 'Ubicación' : 'Location'}
                      </label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder={isSpanish ? 'Ej: Bogotá, Colombia' : 'Ex: Bogotá, Colombia'}
                        value={newMissionLocation}
                        onChange={(e) => setNewMissionLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      {isSpanish ? 'Fecha límite' : 'Deadline'}
                    </label>
                    <input
                      type="date"
                      className={styles.input}
                      min={new Date().toISOString().split('T')[0]}
                      value={newMissionDeadline}
                      onChange={(e) => setNewMissionDeadline(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {isSpanish ? 'Seleccionar asesino' : 'Select assassin'}
                </label>
                <select
                  className={styles.select}
                  value={selectedAssassin}
                  onChange={(e) => setSelectedAssassin(e.target.value)}
                >
                  <option value="">
                    {isSpanish ? 'Selecciona un asesino...' : 'Select an assassin...'}
                  </option>
                  {assassins
                    .filter((a) => a.status === 'available')
                    .map((assassin) => (
                      <option key={assassin.id} value={assassin.id}>
                        {assassin.name} (⭐ {assassin.rating.toFixed(1)})
                      </option>
                    ))}
                </select>
              </div>

              <button className={styles.confirmButton} onClick={handleAssignContract}>
                {isSpanish ? 'Confirmar Asignación' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
