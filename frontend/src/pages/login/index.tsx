import { useLogin } from './useLogin';
import styles from './Login.module.css';

const Login = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    navigate,
    isSpanish,
    handleSubmit,
    getButtonText
  } = useLogin();

  return (
    <div className={styles.container}>

      <div className={styles.logoSection}>
        <div className={styles.logo}>
          <div className={styles.logoCircle}>
            <div className={styles.logoInner}>
              <span className={styles.logoSymbol}>⟨A⟩</span>
            </div>
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoTextTop}>ACTIONES SECUNDUM FIDEI</span>
            <span className={styles.logoTextBottom}>DEPARTMENT OF THE AUDICATOR</span>
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h1 className={styles.title}>
            {isSpanish ? 'INICIO DE SESIÓN' : 'LOGIN'}
          </h1>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              {isSpanish ? 'Correo electrónico' : 'Email'}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              {isSpanish ? 'Contraseña' : 'Password'}
            </label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitButton}>
            {getButtonText()}
          </button>

          <div className={styles.links}>
            <span className={styles.linkText}>
              {isSpanish ? '¿No tienes cuenta? ' : "Don't have an account? "}
            </span>
            <button 
              type="button" 
              className={styles.linkButton}
              onClick={() => navigate('/register')}
            >
              {isSpanish ? 'Regístrate' : 'Sign up'}
            </button>
          </div>

          {/* Panel de credenciales demo */}
          <div className={styles.demoPanel}>
            <h3 className={styles.demoTitle}>
              {isSpanish ? '🎯 Perfiles de Prueba' : '🎯 Test Profiles'}
            </h3>
            <div className={styles.demoUsers}>
              <div className={styles.demoUser}>
                <span className={styles.demoIcon}>👑</span>
                <div className={styles.demoInfo}>
                  <strong>{isSpanish ? 'Administrador' : 'Administrator'}</strong>
                  <code className={styles.demoEmail}>admin@hightable.com</code>
                  <code className={styles.demoPass}>admin123</code>
                </div>
              </div>
              <div className={styles.demoUser}>
                <span className={styles.demoIcon}>🗡️</span>
                <div className={styles.demoInfo}>
                  <strong>{isSpanish ? 'Asesino - John Wick' : 'Assassin - John Wick'}</strong>
                  <code className={styles.demoEmail}>johnwick@continental.com</code>
                  <code className={styles.demoPass}>baba123</code>
                </div>
              </div>
              <div className={styles.demoUser}>
                <span className={styles.demoIcon}>💼</span>
                <div className={styles.demoInfo}>
                  <strong>{isSpanish ? 'Contratista - Winston' : 'Contractor - Winston'}</strong>
                  <code className={styles.demoEmail}>winston@continental.com</code>
                  <code className={styles.demoPass}>continental123</code>
                </div>
              </div>
            </div>
            <p className={styles.demoNote}>
              {isSpanish 
                ? '💡 Cada perfil tiene acceso a diferentes funcionalidades del sistema' 
                : '💡 Each profile has access to different system features'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
