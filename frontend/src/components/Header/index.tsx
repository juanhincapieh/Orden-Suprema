import BuyCoinsModal from '../BuyCoinsModal';
import { NotificationsPanel } from '../NotificationsPanel';
import { useTheme } from '../../context/ThemeContext';
import { useHeader } from './useHeader';
import styles from './Header.module.css';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    navigate,
    isSpanish,
    currentUser,
    showBuyModal,
    setShowBuyModal,
    showProfileMenu,
    setShowProfileMenu,
    profileMenuRef,
    handleLogout,
    getPersonalPageRoute,
    getPersonalPageLabel,
    refreshUser
  } = useHeader();

  return (
    <header className={styles.header}>
      <button className={styles.logo} onClick={() => navigate('/')} aria-label="Home">
        <div className={styles.logoCircle}>
          <span className={styles.logoSymbol}>⟨A⟩</span>
        </div>
      </button>
      
      <nav className={styles.nav}>
        <button 
          className={styles.navButton} 
          aria-label={isSpanish ? "Inicio" : "Home"}
          onClick={() => navigate('/')}
        >
          <span className={styles.navIcon}>🏠</span>
          <span className={styles.navTooltip}>{isSpanish ? "Inicio" : "Home"}</span>
        </button>
        <button 
          className={styles.navButton} 
          aria-label={isSpanish ? "Misiones" : "Missions"}
          onClick={() => navigate('/missions')}
        >
          <span className={styles.navIcon}>📋</span>
          <span className={styles.navTooltip}>{isSpanish ? "Misiones" : "Missions"}</span>
        </button>
        <button 
          className={styles.navButton} 
          aria-label={isSpanish ? "Asesinos" : "Assassins"}
          onClick={() => navigate('/assassins')}
        >
          <span className={styles.navIcon}>🗡️</span>
          <span className={styles.navTooltip}>{isSpanish ? "Asesinos" : "Assassins"}</span>
        </button>
        <button 
          className={styles.navButton} 
          aria-label={isSpanish ? "Nosotros" : "About Us"}
          onClick={() => navigate('/aboutus')}
        >
          <span className={styles.navIcon}>👥</span>
          <span className={styles.navTooltip}>{isSpanish ? "Nosotros" : "About Us"}</span>
        </button>
        <button 
          className={styles.navButton} 
          aria-label={isSpanish ? "Reseñas" : "Reviews"}
          onClick={() => navigate('/reviews')}
        >
          <span className={styles.navIcon}>⭐</span>
          <span className={styles.navTooltip}>{isSpanish ? "Reseñas" : "Reviews"}</span>
        </button>
        <button 
          className={styles.navButton} 
          aria-label={isSpanish ? "Clasificación" : "Leaderboard"} 
          onClick={() => navigate('/leaderboard')}
        >
          <span className={styles.navIcon}>🏆</span>
          <span className={styles.navTooltip}>{isSpanish ? "Clasificación" : "Leaderboard"}</span>
        </button>
      </nav>

      <div className={styles.authSection}>
        <div className={styles.flag}>🇪🇸</div>
        {currentUser ? (
          <>
            <button 
              className={styles.personalPageButton}
              onClick={() => navigate(getPersonalPageRoute())}
            >
              <span className={styles.personalPageIcon}>👤</span>
              <span className={styles.personalPageText}>{getPersonalPageLabel()}</span>
            </button>

            <NotificationsPanel 
              currentUser={currentUser}
              isSpanish={isSpanish}
            />

            <button 
              className={styles.coinsDisplay}
              onClick={() => setShowBuyModal(true)}
            >
              <span className={styles.coinIcon}>🪙</span>
              <span className={styles.coinAmount}>
                {currentUser.coins.toLocaleString()}
              </span>
            </button>
            
            <div className={styles.profileContainer} ref={profileMenuRef}>
              <button 
                className={styles.profileButton}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className={styles.profileAvatar}>
                  {currentUser.nickname.charAt(0).toUpperCase()}
                </div>
              </button>

              {showProfileMenu && (
                <div className={styles.profileMenu}>
                  <div className={styles.profileMenuHeader}>
                    <div className={styles.profileMenuAvatar}>
                      {currentUser.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.profileMenuInfo}>
                      <p className={styles.profileMenuName}>{currentUser.nickname}</p>
                      <p className={styles.profileMenuEmail}>{currentUser.email}</p>
                    </div>
                  </div>

                  <div className={styles.profileMenuDivider}></div>

                  <div className={styles.profileMenuItem}>
                    <div className={styles.themeToggleContainer}>
                      <span className={styles.profileMenuIcon}>
                        {theme === 'dark' ? '🌙' : '☀️'}
                      </span>
                      <span className={styles.themeLabel}>
                        {isSpanish ? 'Tema' : 'Theme'}
                      </span>
                      <button
                        className={styles.themeToggle}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTheme();
                        }}
                        aria-label={isSpanish ? 'Cambiar tema' : 'Toggle theme'}
                      >
                        <span className={`${styles.themeToggleSlider} ${theme === 'light' ? styles.themeToggleSliderLight : ''}`}>
                          <span className={styles.themeToggleIcon}>
                            {theme === 'dark' ? '🌙' : '☀️'}
                          </span>
                        </span>
                      </button>
                    </div>
                  </div>

                  <button 
                    className={styles.profileMenuItem}
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                  >
                    <span className={styles.profileMenuIcon}>🚪</span>
                    {isSpanish ? 'Cerrar sesión' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button className={styles.loginButton} onClick={() => navigate('/login')}>
            {isSpanish ? 'INICIAR SESIÓN' : 'LOG IN'}
          </button>
        )}
      </div>

      {/* Modal de Compra de Monedas */}
      {currentUser && (
        <BuyCoinsModal
          isOpen={showBuyModal}
          onClose={() => setShowBuyModal(false)}
          userEmail={currentUser.email}
          currentCoins={currentUser.coins}
          onPurchaseComplete={refreshUser}
        />
      )}
    </header>
  );
};

export default Header;
