import BuyCoinsModal from '../BuyCoinsModal';
import { NotificationsPanel } from '../NotificationsPanel';
import { useTheme } from '../../context/ThemeContext';
import { useHeader } from './useHeader';
import { Home, FileText, Sword, Users, Star, Trophy } from 'lucide-react';
import { useState } from 'react';
import styles from './Header.module.css';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    navigate,
    isSpanish,
    toggleLanguage,
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

  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const navItems = [
    { id: 'home', Icon: Home, label: isSpanish ? 'Inicio' : 'Home', path: '/' },
    { id: 'missions', Icon: FileText, label: isSpanish ? 'Misiones' : 'Missions', path: '/missions' },
    { id: 'assassins', Icon: Sword, label: isSpanish ? 'Asesinos' : 'Assassins', path: '/assassins' },
    { id: 'aboutus', Icon: Users, label: isSpanish ? 'Nosotros' : 'About Us', path: '/aboutus' },
    { id: 'reviews', Icon: Star, label: isSpanish ? 'Reseñas' : 'Reviews', path: '/reviews' },
    { id: 'leaderboard', Icon: Trophy, label: isSpanish ? 'Clasificación' : 'Leaderboard', path: '/leaderboard' },
  ];

  return (
    <header className={styles.header}>
      <button className={styles.logo} onClick={() => navigate('/')} aria-label="Home">
        <div className={styles.logoCircle}>
          <span className={styles.logoSymbol}>⟨A⟩</span>
        </div>
      </button>
      
      <nav className={styles.nav}>
        {navItems.map(({ id, Icon, label, path }) => (
          <button
            key={id}
            className={styles.navButton}
            aria-label={label}
            onClick={() => navigate(path)}
            onMouseEnter={() => setHoveredIcon(id)}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <Icon className={styles.navIcon} />
            <span className={styles.navTooltip}>{label}</span>
            {hoveredIcon === id && <span className={styles.navGlow}></span>}
          </button>
        ))}
      </nav>

      <div className={styles.authSection}>
        <button 
          className={styles.flag}
          onClick={toggleLanguage}
          aria-label={isSpanish ? 'Cambiar a inglés' : 'Switch to Spanish'}
          title={isSpanish ? 'Cambiar a inglés' : 'Switch to Spanish'}
        >
          {isSpanish ? '🇪🇸' : '🇺🇸'}
        </button>
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
