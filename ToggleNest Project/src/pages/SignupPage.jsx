import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiChevronRight, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { useAuthStore } from '../stores/useStore';

const SignupPage = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [globalRole, setGlobalRole] = React.useState('member');
    const [title, setTitle] = React.useState('Frontend Developer');
    const [customRole, setCustomRole] = React.useState('');
    const [customTitle, setCustomTitle] = React.useState('');
    const [error, setError] = React.useState('');

    const validatePasswordStrength = (pw) => {
        if (!pw || pw.length < 8) return false;
        if (!/[A-Z]/.test(pw)) return false;
        if (!/[a-z]/.test(pw)) return false;
        if (!/[0-9]/.test(pw)) return false;
        if (!/[^A-Za-z0-9]/.test(pw)) return false;
        return true;
    };

    const pwChecks = [
        { id: 'length', label: '8 characters', test: pw => pw && pw.length >= 8 },
        { id: 'upper', label: 'Uppercase letter', test: pw => /[A-Z]/.test(pw) },
        { id: 'lower', label: 'Lowercase letter', test: pw => /[a-z]/.test(pw) },
        { id: 'number', label: 'number', test: pw => /[0-9]/.test(pw) },
        { id: 'special', label: 'special character', test: pw => /[^A-Za-z0-9]/.test(pw) },
    ];

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     setError('');

    //     if (!name || !email || !password || !confirmPassword) {
    //         setError('All fields are required.');
    //         return;
    //     }
    //     if (password !== confirmPassword) {
    //         setError('Passwords do not match.');
    //         return;
    //     }

    //     // --- SIGNUP LOGIC (MOCK) ---
    //     // 1. API call to register user
    //     // 2. On SUCCESS: Log the user in (setting a token/session) and then navigate.

    //     console.log('Attempting signup with:', { name, email });

    //     // MOCK SUCCESS: Redirect to dashboard
    //     navigate('/dashboard'); 

    // };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Validate password strength
        if (!validatePasswordStrength(password)) {
            setError('Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.');
            return;
        }

        // Validate custom fields when "Other" selections are active
        if (globalRole === 'other' && !customRole.trim()) {
            setError('Please enter a custom role.');
            return;
        }
        if (title === 'Other' && !customTitle.trim()) {
            setError('Please enter a custom title.');
            return;
        }

        try {
            // Build payload according to frontend requirements
            const payload = {
                name,
                email,
                password,
                globalRole: globalRole === 'other' && customRole.trim() ? 'member' : globalRole,
                title: title === 'Other' && customTitle.trim() ? customTitle : title,
            };

            if (globalRole === 'other' && customRole.trim()) payload.customRole = customRole.trim();
            if (title === 'Other' && customTitle.trim()) payload.customTitle = customTitle.trim();

            const res = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            // Store raw token for route guarding and legacy checks
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.user.id);
            localStorage.setItem("userName", data.user.name);
            localStorage.setItem("userTitle", data.user.title || '');
            localStorage.setItem("userRole", data.user.role || data.user.globalRole || 'Viewer');

            // Persist authenticated user in Zustand store (and auth-storage)
            const userWithRole = { ...data.user, role: data.user.role || data.user.globalRole || 'Viewer' };
            login({ user: userWithRole, token: data.token });
            navigate("/dashboard");

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, var(--color-primary-blue) 0%, var(--color-secondary-green) 25%, #FF6B35 50%, var(--color-danger-red) 75%, var(--color-primary-blue) 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 8s ease infinite',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '10px',
            fontFamily: "'Roboto', sans-serif",
            overflow: 'hidden'
        }}>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap');
                    
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
                    maxWidth: '600px',
                    maxHeight: '95vh',
                    padding: '20px',
                    backgroundColor: 'var(--color-bg-canvas)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-soft-float)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--color-border-subtle)',
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
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-primary-blue)', marginBottom: '4px' }}>
                        Welcome to ToggleNest
                    </h1>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', margin: 0 }}>
                        Streamline your workflow, amplify your productivity
                    </p>
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-dark)', textAlign: 'center' }}>Create Account</h2>
                <p style={{ marginBottom: '15px', color: 'var(--color-text-light)', textAlign: 'center', fontSize: '0.8rem' }}>
                    Get started with your free trial today.
                </p>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-danger-red)', padding: '8px', borderRadius: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}>
                            <FiAlertCircle size={16} style={{ marginRight: '6px' }} />
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: 'var(--color-text-dark)', fontSize: '0.8rem' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <FiUser size={14} style={{ position: 'absolute', left: '8px', top: '8px', color: 'var(--color-text-light)' }} />
                            <input
                                type="text"
                                placeholder="Jane Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={{ width: '100%', padding: '6px 6px 6px 30px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', fontSize: '0.85rem', transition: 'all 0.3s' }}
                                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary-blue)'}
                                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border-subtle)'}
                            />
                        </div>
                    </div>

                    {/* Role and Title side by side */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: 'var(--color-text-dark)', fontSize: '0.8rem' }}>Role</label>
                            <select
                                value={globalRole}
                                onChange={(e) => setGlobalRole(e.target.value)}
                                style={{ width: '100%', padding: '6px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', fontSize: '0.85rem' }}
                            >
                                <option value="admin">admin</option>
                                <option value="member">member</option>
                                <option value="viewer">viewer</option>
                                <option value="other">other</option>
                            </select>
                        </div>

                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: 'var(--color-text-dark)', fontSize: '0.8rem' }}>Title</label>
                            <select
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{ width: '100%', padding: '6px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', fontSize: '0.85rem' }}
                            >
                                <option>Frontend Developer</option>
                                <option>Backend Developer</option>
                                <option>Designer</option>
                                <option>DevOps Engineer</option>
                                <option>Student</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Custom Role and Title side by side when needed */}
                    {(globalRole === 'other' || title === 'Other') && (
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '15px' }}>
                            {globalRole === 'other' && (
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--color-text-dark)', fontSize: '0.9rem' }}>Enter custom role</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Product Manager"
                                        value={customRole}
                                        onChange={(e) => setCustomRole(e.target.value)}
                                        style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', fontSize: '0.95rem' }}
                                    />
                                </div>
                            )}
                            {title === 'Other' && (
                                <div style={{ flex: globalRole === 'other' ? 1 : 'none', width: globalRole === 'other' ? 'auto' : '100%' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: 'var(--color-text-dark)', fontSize: '0.8rem' }}>Enter custom title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Machine Learning Researcher"
                                        value={customTitle}
                                        onChange={(e) => setCustomTitle(e.target.value)}
                                        style={{ width: '100%', padding: '6px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', fontSize: '0.85rem' }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: 'var(--color-text-dark)', fontSize: '0.8rem' }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <FiMail size={14} style={{ position: 'absolute', left: '8px', top: '8px', color: 'var(--color-text-light)' }} />
                            <input
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ width: '100%', padding: '6px 6px 6px 30px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', fontSize: '0.85rem', transition: 'all 0.3s' }}
                                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary-blue)'}
                                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border-subtle)'}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: 'var(--color-text-dark)', fontSize: '0.8rem' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <FiLock size={14} style={{ position: 'absolute', left: '8px', top: '8px', color: 'var(--color-text-light)' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ width: '100%', padding: '6px 30px 6px 30px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', fontSize: '0.85rem', transition: 'all 0.3s' }}
                                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary-blue)'}
                                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border-subtle)'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(s => !s)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                style={{ position: 'absolute', right: '10px', top: '8px', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                        </div>
                        <p style={{ marginTop: '4px', color: 'var(--color-text-light)', fontSize: '0.7rem' }}>
                            Password must include the items below.
                        </p>

                        <div style={{ marginTop: '4px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                            {pwChecks.map((rule) => {
                                const ok = rule.test(password);
                                return (
                                    <div key={rule.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: ok ? 'var(--color-secondary-green)' : 'var(--color-danger-red)', display: 'inline-block', marginRight: 4 }} />
                                        <span style={{ color: ok ? 'var(--color-secondary-green)' : 'var(--color-danger-red)', fontSize: '0.7rem', textAlign: 'center' }}>
                                            {rule.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: 'var(--color-text-dark)', fontSize: '0.8rem' }}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <FiLock size={14} style={{ position: 'absolute', left: '8px', top: '8px', color: 'var(--color-text-light)' }} />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onPaste={(e) => e.preventDefault()}
                                onCopy={(e) => e.preventDefault()}
                                onCut={(e) => e.preventDefault()}
                                required
                                style={{ width: '100%', padding: '6px 30px 6px 30px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', fontSize: '0.85rem', transition: 'all 0.3s' }}
                                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary-blue)'}
                                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border-subtle)'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(s => !s)}
                                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                style={{ position: 'absolute', right: '10px', top: '8px', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
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
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(0, 122, 255, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
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
                        Sign Up <FiChevronRight size={16} style={{ marginLeft: '6px' }} />
                    </button>
                </form>

                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.8rem' }}>
                        Already have an account? {' '}
                        <Link to="/login" style={{ color: 'var(--color-primary-blue)', textDecoration: 'none', fontWeight: 600 }}>
                            Log In
                        </Link>
                    </p>
                </div>

            </motion.div>
        </div>
    );
};

export default SignupPage;