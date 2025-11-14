import { useRegister } from './useRegister';
import { Captcha } from '../../components/Captcha';
import { Eye, EyeOff, Briefcase, Sword, Crown } from 'lucide-react';
import styles from './Register.module.css';

const Register = () => {
  const {
    nickname,
    setNickname,
    email,
    setEmail,
    password,
    setPassword,
    role,
    setRole,
    showPassword,
    setShowPassword,
    acceptTerms,
    setAcceptTerms,
    setIsCaptchaVerified,
    navigate,
    isSpanish,
    handleSubmit
  } = useRegister();

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
            {isSpanish ? 'CREAR UNA CUENTA' : 'CREATE AN ACCOUNT'}
          </h1>

          <div className={styles.inputGroup}>
            <label htmlFor="nickname" className={styles.label}>
              {isSpanish ? 'Apodo de asesino' : 'Assassin nickname'}
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={styles.input}
              required
            />
          </div>

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
                minLength={8}
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
            <p className={styles.hint}>
              {isSpanish 
                ? 'Usa 8 o más caracteres con una mezcla de letras, números y símbolos' 
                : 'Use 8 or more characters with a mix of letters, numbers and symbols'}
            </p>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              {isSpanish ? 'Selecciona tu rol' : 'Select your role'}
            </label>
            <div className={styles.roleSelector}>
              <button
                type="button"
                className={`${styles.roleOption} ${role === 'contractor' ? styles.roleActive : ''}`}
                onClick={() => setRole('contractor')}
              >
                <Briefcase className={styles.roleIcon} size={32} />
                <span className={styles.roleLabel}>
                  {isSpanish ? 'Contratista' : 'Contractor'}
                </span>
                <span className={styles.roleDescription}>
                  {isSpanish ? 'Publica misiones' : 'Post missions'}
                </span>
              </button>

              <button
                type="button"
                className={`${styles.roleOption} ${role === 'assassin' ? styles.roleActive : ''}`}
                onClick={() => setRole('assassin')}
              >
                <Sword className={styles.roleIcon} size={32} />
                <span className={styles.roleLabel}>
                  {isSpanish ? 'Asesino' : 'Assassin'}
                </span>
                <span className={styles.roleDescription}>
                  {isSpanish ? 'Completa misiones' : 'Complete missions'}
                </span>
              </button>

              <button
                type="button"
                className={`${styles.roleOption} ${role === 'admin' ? styles.roleActive : ''}`}
                onClick={() => setRole('admin')}
              >
                <Crown className={styles.roleIcon} size={32} />
                <span className={styles.roleLabel}>
                  {isSpanish ? 'Administrador' : 'Admin'}
                </span>
                <span className={styles.roleDescription}>
                  {isSpanish ? 'Gestiona todo' : 'Manage everything'}
                </span>
              </button>
            </div>
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                {isSpanish ? 'Al crear una cuenta, estás de acuerdo con nuestros ' : 'By creating an account, you agree to our '}
                <button 
                  type="button" 
                  className={styles.link}
                  onClick={() => window.open('/terms', '_blank')}
                >
                  {isSpanish ? 'Términos de uso' : 'Terms of Use'}
                </button>
                {isSpanish ? ' y la ' : ' and '}
                <button 
                  type="button" 
                  className={styles.link}
                  onClick={() => window.open('/privacy', '_blank')}
                >
                  {isSpanish ? 'Política de Privacidad' : 'Privacy Policy'}
                </button>
              </span>
            </label>
          </div>

          <Captcha 
            onVerify={setIsCaptchaVerified}
            isSpanish={isSpanish}
          />

          <button type="submit" className={styles.submitButton}>
            {isSpanish ? 'Crear cuenta' : 'Create account'}
          </button>

          <div className={styles.links}>
            <span className={styles.linkText}>
              {isSpanish ? '¿Ya tienes una cuenta? ' : 'Already have an account? '}
            </span>
            <button 
              type="button" 
              className={styles.linkButton}
              onClick={() => navigate('/login')}
            >
              {isSpanish ? 'Iniciar sesión' : 'Log in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
