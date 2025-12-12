import BuyCoinsModal from '../BuyCoinsModal';
import { NotificationsPanel } from '../NotificationsPanel';
import { useTheme } from '../../context/ThemeContext';
import { useHeader } from './useHeader';
import {
  Home,
  FileText,
  Sword,
  Users,
  Star,
  Trophy,
  User,
  Coins,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cerrar menú móvil al cambiar de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar menú móvil al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  // Wrapper para prevenir clicks múltiples
  const handleNavigation = (path: string) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    setMobileMenuOpen(false);
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

      {/* Botón hamburguesa para móvil */}
      <button
        className={styles.mobileMenuButton}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para cerrar menú */}
      {mobileMenuOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ''}`}>
        {/* Sección de usuario en móvil */}
        {currentUser && (
          <div className={styles.mobileUserSection}>
            <div className={styles.mobileUserInfo}>
              <div className={styles.mobileUserAvatar}>
                {currentUser.nickname.charAt(0).toUpperCase()}
              </div>
              <div className={styles.mobileUserDetails}>
                <span className={styles.mobileUserName}>{currentUser.nickname}</span>
                <span className={styles.mobileUserCoins}>
                  <Coins size={14} />
                  {currentUser.coins.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navegación principal */}
        <div className={styles.mobileNavSection}>
          <span className={styles.mobileNavTitle}>
            {isSpanish ? 'Navegación' : 'Navigation'}
          </span>
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
                <span className={styles.navLabelMobile}>{label}</span>
                {isActive ? (
                  <span className={styles.navLabel}>{label}</span>
                ) : (
                  <span className={styles.navTooltip}>{label}</span>
                )}
                {hoveredIcon === id && <span className={styles.navGlow}></span>}
              </button>
            );
          })}
        </div>

        {/* Sección de cuenta en móvil */}
        {currentUser && (
          <div className={styles.mobileAccountSection}>
            <span className={styles.mobileNavTitle}>
              {isSpanish ? 'Mi Cuenta' : 'My Account'}
            </span>
            <button
              className={styles.navButton}
              onClick={() => handleNavigation(getPersonalPageRoute())}
              disabled={isNavigating}
            >
              <User className={styles.navIcon} />
              <span className={styles.navLabelMobile}>{getPersonalPageLabel()}</span>
            </button>
            <button
              className={styles.navButton}
              onClick={() => {
                setMobileMenuOpen(false);
                setShowBuyModal(true);
              }}
            >
              <Coins className={styles.navIcon} />
              <span className={styles.navLabelMobile}>
                {isSpanish ? 'Comprar Monedas' : 'Buy Coins'}
              </span>
            </button>
            <button
              className={styles.navButton}
              onClick={() => {
                toggleTheme();
              }}
            >
              {theme === 'dark' ? (
                <Moon className={styles.navIcon} />
              ) : (
                <Sun className={styles.navIcon} />
              )}
              <span className={styles.navLabelMobile}>
                {isSpanish ? 'Cambiar Tema' : 'Toggle Theme'}
              </span>
            </button>
            <button
              className={`${styles.navButton} ${styles.navButtonDanger}`}
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
            >
              <LogOut className={styles.navIcon} />
              <span className={styles.navLabelMobile}>
                {isSpanish ? 'Cerrar Sesión' : 'Logout'}
              </span>
            </button>
          </div>
        )}

        {/* Botón de login en móvil si no hay usuario */}
        {!currentUser && (
          <div className={styles.mobileAccountSection}>
            <button
              className={`${styles.navButton} ${styles.navButtonPrimary}`}
              onClick={() => handleNavigation('/login')}
              disabled={isNavigating}
            >
              <User className={styles.navIcon} />
              <span className={styles.navLabelMobile}>
                {isSpanish ? 'Iniciar Sesión' : 'Log In'}
              </span>
            </button>
          </div>
        )}
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
        {/* Botón de tema cuando NO está logueado */}
        {!currentUser && (
          <button
            className={styles.themeButton}
            onClick={toggleTheme}
            aria-label={isSpanish ? 'Cambiar tema' : 'Toggle theme'}
            title={isSpanish ? (theme === 'dark' ? 'Modo claro' : 'Modo oscuro') : (theme === 'dark' ? 'Light mode' : 'Dark mode')}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

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
