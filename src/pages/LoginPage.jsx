import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiChevronRight, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { ACCENT_CYAN, ACCENT_EMERALD, DANGER_COLOR, TEXT_PRIMARY, TEXT_SECONDARY, BORDER_COLOR, SHADOW_LG } from '../color-constants';
import { useAuthStore } from '../stores/useStore';

const LoginPage = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.user.id);
            localStorage.setItem("userName", data.user.name);
            // Persist authenticated user in Zustand store (and auth-storage)
            login({ user: data.user, token: data.token });
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${ACCENT_CYAN} 0%, ${ACCENT_EMERALD} 50%, ${ACCENT_CYAN} 100%)`,
            backgroundSize: '400% 400%',
            animation: 'gradientShift 8s ease infinite',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '10px',
            fontFamily: "'Inter', sans-serif",
            overflow: 'hidden'
        }}>
            <style>
                {`
                    @keyframes gradientShift {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `}
            </style>
            <motion.div
                style={{
                    width: '100%',
                    maxWidth: '450px',
                    maxHeight: '95vh',
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: SHADOW_LG,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${BORDER_COLOR}`,
                    overflow: 'hidden'
                }}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                    duration: 0.8,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                }}
                whileHover={{
                    scale: 1.02,
                    boxShadow: '0 20px 40px rgba(0, 122, 255, 0.3)',
                    transition: { duration: 0.3 }
                }}
            >

                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 600, color: ACCENT_CYAN, marginBottom: '4px' }}>
                        Welcome to ToggleNest
                    </h1>
                    <p style={{ fontSize: '0.8rem', color: TEXT_SECONDARY, margin: 0 }}>
                        Streamline your workflow, amplify your productivity
                    </p>
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: TEXT_PRIMARY, textAlign: 'center' }}>Welcome Back</h2>
                <p style={{ marginBottom: '15px', color: TEXT_SECONDARY, textAlign: 'center', fontSize: '0.8rem' }}>Enter your credentials to continue.</p>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: DANGER_COLOR, padding: '8px', borderRadius: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: 500, border: `1px solid ${DANGER_COLOR}20` }}>
                            <FiAlertCircle size={16} style={{ marginRight: '6px' }} />
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: TEXT_PRIMARY, fontSize: '0.8rem' }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <FiMail size={14} style={{ position: 'absolute', left: '8px', top: '8px', color: TEXT_SECONDARY }} />
                            <input
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '6px 6px 6px 30px',
                                    border: `1px solid ${BORDER_COLOR}`,
                                    borderRadius: '6px',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.3s',
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = ACCENT_CYAN}
                                onBlur={e => e.currentTarget.style.borderColor = BORDER_COLOR}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: TEXT_PRIMARY, fontSize: '0.9rem' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <FiLock size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: TEXT_SECONDARY }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 40px 8px 35px',
                                    border: `1px solid ${BORDER_COLOR}`,
                                    borderRadius: '6px',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.3s',
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = ACCENT_CYAN}
                                onBlur={e => e.currentTarget.style.borderColor = BORDER_COLOR}
                            />
                            <div
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '10px',
                                    cursor: 'pointer',
                                    color: TEXT_SECONDARY,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </div>
                        </div>
                    </div>

                    {/* Login Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'linear-gradient(135deg, var(--color-primary-blue) 0%, var(--color-secondary-green) 100%)',
                            color: 'white',
                            fontWeight: 600,
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(0, 122, 255, 0.4)',
                            marginBottom: '15px'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(0, 122, 255, 0.6)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(0, 122, 255, 0.4)';
                        }}
                    >
                        Log In <FiChevronRight size={16} />
                    </motion.button>
                </form>

                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
                        Don't have an account? {' '}
                        <Link to="/signup" style={{ color: 'var(--color-primary-blue)', textDecoration: 'none', fontWeight: 600, transition: 'all 0.3s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-secondary-green)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-primary-blue)'}
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>

            </motion.div>
        </div>
    );
};

export default LoginPage;
