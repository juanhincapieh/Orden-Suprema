import { useLogin } from './useLogin';
import { Eye, EyeOff, Target, Crown, Sword, Briefcase, Lightbulb } from 'lucide-react';
import styles from './Login.module.css';

const Login = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    show2FA,
    twoFactorCode,
    setTwoFactorCode,
    generatedCode,
    navigate,
    isSpanish,
    handleSubmit,
    handleCancel2FA,
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

          {!show2FA ? (
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
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Sección 2FA */}
              <div className={styles.twoFactorSection}>
                <div className={styles.twoFactorHeader}>
                  <span className={styles.twoFactorIcon}><Target size={24} /></span>
                  <h2 className={styles.twoFactorTitle}>
                    {isSpanish ? 'Autenticación de Dos Factores' : 'Two-Factor Authentication'}
                  </h2>
                </div>
                
                <p className={styles.twoFactorDescription}>
                  {isSpanish 
                    ? 'Ingresa el código de verificación que aparece a continuación:'
                    : 'Enter the verification code shown below:'}
                </p>

                {/* Código generado visible */}
                <div className={styles.generatedCodeBox}>
                  <span className={styles.generatedCodeLabel}>
                    {isSpanish ? 'Tu código de verificación:' : 'Your verification code:'}
                  </span>
                  <div className={styles.generatedCode}>
                    {generatedCode}
                  </div>
                  <span className={styles.generatedCodeHint}>
                    {isSpanish ? 'Copia este código' : 'Copy this code'}
                  </span>
                </div>

                {/* Input para ingresar el código */}
                <div className={styles.inputGroup}>
                  <label htmlFor="twoFactorCode" className={styles.label}>
                    {isSpanish ? 'Ingresa el código' : 'Enter the code'}
                  </label>
                  <input
                    id="twoFactorCode"
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    className={`${styles.input} ${styles.codeInput}`}
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancel2FA}
                >
                  {isSpanish ? '← Volver' : '← Back'}
                </button>
              </div>
            </>
          )}

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
          {!show2FA && (
          <div className={styles.demoPanel}>
            <h3 className={styles.demoTitle}>
              <Target size={20} /> {isSpanish ? 'Perfiles de Prueba' : 'Test Profiles'}
            </h3>
            <div className={styles.demoUsers}>
              <div className={styles.demoUser}>
                <Crown className={styles.demoIcon} size={24} />
                <div className={styles.demoInfo}>
                  <strong>{isSpanish ? 'Administrador' : 'Administrator'}</strong>
                  <code className={styles.demoEmail}>admin@hightable.com</code>
                  <code className={styles.demoPass}>admin123</code>
                </div>
              </div>
              <div className={styles.demoUser}>
                <Sword className={styles.demoIcon} size={24} />
                <div className={styles.demoInfo}>
                  <strong>{isSpanish ? 'Asesino - John Wick' : 'Assassin - John Wick'}</strong>
                  <code className={styles.demoEmail}>johnwick@continental.com</code>
                  <code className={styles.demoPass}>baba123</code>
                </div>
              </div>
              <div className={styles.demoUser}>
                <Briefcase className={styles.demoIcon} size={24} />
                <div className={styles.demoInfo}>
                  <strong>{isSpanish ? 'Contratista - Winston' : 'Contractor - Winston'}</strong>
                  <code className={styles.demoEmail}>winston@continental.com</code>
                  <code className={styles.demoPass}>continental123</code>
                </div>
              </div>
            </div>
            <p className={styles.demoNote}>
              <Lightbulb size={16} /> {isSpanish 
                ? 'Cada perfil tiene acceso a diferentes funcionalidades del sistema' 
                : 'Each profile has access to different system features'}
            </p>
          </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
