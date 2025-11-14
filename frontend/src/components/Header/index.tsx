import BuyCoinsModal from '../BuyCoinsModal';
import { NotificationsPanel } from '../NotificationsPanel';
import { useTheme } from '../../context/ThemeContext';
import { useHeader } from './useHeader';
import { Home, FileText, Sword, Users, Star, Trophy, User, Coins, Moon, Sun, LogOut } from 'lucide-react';
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
  const [isNavigating, setIsNavigating] = useState(false);

  // Wrapper para prevenir clicks múltiples
  const handleNavigation = (path: string) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    navigate(path);
    
    // Resetear después de un tiempo
    setTimeout(() => {
      setIsNavigating(false);
    }, 300);
  };

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
      <button 
        className={styles.logo} 
        onClick={() => handleNavigation('/')} 
        aria-label="Home"
        disabled={isNavigating}
      >
        <div className={styles.logoCircle}>
          <span className={styles.logoSymbol}>⟨A⟩</span>
        </div>
      </button>
      
      <nav className={styles.nav}>
        {navItems.map(({ id, Icon, label, path }) => {
          const isActive = window.location.pathname === path;
          return (
            <button
              key={id}
              className={`${styles.navButton} ${isActive ? styles.navButtonActive : ''}`}
              aria-label={label}
              onClick={() => handleNavigation(path)}
              onMouseEnter={() => setHoveredIcon(id)}
              onMouseLeave={() => setHoveredIcon(null)}
              disabled={isNavigating}
            >
              <Icon className={styles.navIcon} />
              {isActive ? (
                <span className={styles.navLabel}>{label}</span>
              ) : (
                <span className={styles.navTooltip}>{label}</span>
              )}
              {hoveredIcon === id && <span className={styles.navGlow}></span>}
            </button>
          );
        })}
      </nav>

      <div className={styles.authSection}>
        <button 
          className={styles.flag}
          onClick={toggleLanguage}
          aria-label={isSpanish ? 'Cambiar a inglés' : 'Switch to Spanish'}
          title={isSpanish ? 'Cambiar a inglés' : 'Switch to Spanish'}
        >
          <span className={styles.flagText}>{isSpanish ? 'ES' : 'EN'}</span>
        </button>
        {currentUser ? (
          <>
            <button 
              className={styles.personalPageButton}
              onClick={() => handleNavigation(getPersonalPageRoute())}
              disabled={isNavigating}
            >
              <User className={styles.personalPageIcon} size={20} />
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
              <Coins className={styles.coinIcon} size={20} />
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
                      {theme === 'dark' ? (
                        <Moon className={styles.profileMenuIcon} size={18} />
                      ) : (
                        <Sun className={styles.profileMenuIcon} size={18} />
                      )}
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
                          {theme === 'dark' ? (
                            <Moon className={styles.themeToggleIcon} size={14} />
                          ) : (
                            <Sun className={styles.themeToggleIcon} size={14} />
                          )}
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
                    <LogOut className={styles.profileMenuIcon} size={18} />
                    {isSpanish ? 'Cerrar sesión' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button 
            className={styles.loginButton} 
            onClick={() => handleNavigation('/login')}
            disabled={isNavigating}
          >
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
