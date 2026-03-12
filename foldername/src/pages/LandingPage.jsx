import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/CoreStyles.css';
import { FiRefreshCw, FiColumns, FiLock, FiChevronRight, FiCheckCircle, FiGrid } from 'react-icons/fi';
import logo from '../logo.png';
import landing from '../landing.png';

// --- Multi-Color Palette Definitions ---
const PRIMARY_YELLOW = '#FFC300'; // Deep Yellow/Gold (Brand/Primary)
const ACCENT_RED = '#D00000';    // Deep Red (Danger/Urgency)
const ACCENT_TEAL = '#008080';   // Deep Teal (Secondary/Neutral Accent)
const ACCENT_GREEN = '#4CAF50';  // New Accent Green (For Highlights)
const BACKGROUND_IVORY = '#FAFAF0'; // Ivory/Off-White (Neutral Background)
const ACCENT_BLUE = '#2563EB'; // Extra Accent Blue for Kanban

// Helper function to map feature color names to defined hex codes
const getColorCode = (colorName) => {
    switch (colorName) {
        case 'primary-yellow': return PRIMARY_YELLOW;
        case 'accent-red': return ACCENT_RED;
        case 'accent-teal': return ACCENT_TEAL;
        case 'accent-green': return ACCENT_GREEN;
        case 'accent-blue': return ACCENT_BLUE;
        default: return PRIMARY_YELLOW;
    }
}

// --- Sub-Components ---
const FeatureItem = ({ Icon, title, description, colorName }) => (
    <div
        className="feature-item card-container"
        style={{ padding: '30px' }}
    >
        <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            backgroundColor: getColorCode(colorName),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px'
        }}>
            <Icon size={22} style={{ color: 'white' }} />
        </div>
        <h3 style={{ marginBottom: '8px', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text-dark)' }}>{title}</h3>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>{description}</p>
    </div>
);

const LandingPage = () => {
    return (
        <>
            {/* Content Container */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                minHeight: '100vh',
                overflowY: 'auto',
                background: '#FFFFFF'
            }}>

                {/* --- 1. Fixed Navigation Bar (Deep Yellow) --- */}
                <header
                    className="landing-nav"
                    style={{
                        backgroundColor: '#FFFFFF',
                        borderBottom: '1px solid #E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 50px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={logo} alt="ToggleNest Logo" style={{ height: '80px', width: 'auto' }} />
                    </div>
                    <nav style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                        <Link
                            to="/login"
                            style={{
                                color: ACCENT_GREEN,
                                textDecoration: 'none',
                                fontWeight: 600,
                                marginLeft: '10px',
                                transition: 'all 0.3s ease', // smooth transition for hover
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = PRIMARY_YELLOW} // change color on hover
                            onMouseLeave={e => e.currentTarget.style.color = ACCENT_GREEN}   // revert color
                        >
                            Log In
                        </Link>
                        <Link to="/signup" className="btn-primary" style={{
                            textDecoration: 'none',
                            padding: '10px 25px',
                            borderRadius: '6px',
                            fontSize: '0.95rem',
                            backgroundColor: PRIMARY_YELLOW,
                            border: `1px solid ${PRIMARY_YELLOW}`,
                            color: 'var(--color-text-dark)',
                            transition: 'all 0.3s ease'
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            Start Free Trial
                        </Link>
                    </nav>

                </header>

                {/* --- 2. Hero Section (Multi-Color Gradient Background & Green Accent Text) --- */}
                <section
                    className="hero-section"
                    style={{
                        background: '#FFFFFF',
                        padding: '120px 50px',
                        marginBottom: '60px'
                    }}
                >
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 1fr',
                        alignItems: 'center',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        width: '100%'
                    }}>
                        {/* Hero Text */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: ACCENT_GREEN, fontWeight: 600 }}>
                                <FiCheckCircle size={18} style={{ color: ACCENT_GREEN }} />
                                <span>PROJECT MANAGEMENT SIMPLIFIED</span>
                            </div>
                            <h2 style={{ fontSize: '3.8rem', fontWeight: 800, margin: '15px 0', color: 'var(--color-text-dark)', lineHeight: 1.1 }}>
                                The <span style={{
                                    color: 'transparent',
                                    background: `linear-gradient(45deg, ${ACCENT_TEAL} 0%, ${PRIMARY_YELLOW} 100%)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>modern workspace</span> built for team success.
                            </h2>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '30px' }}>
                                <Link to="/signup" className="btn-primary" style={{
                                    textDecoration: 'none',
                                    padding: '18px 45px',
                                    borderRadius: '10px',
                                    fontSize: '1.15rem',
                                    fontWeight: 600,
                                    backgroundColor: PRIMARY_YELLOW,
                                    border: `2px solid ${PRIMARY_YELLOW}`,
                                    color: 'var(--color-text-dark)',
                                    boxShadow: '0 4px 15px rgba(255, 195, 0, 0.3)',
                                    transition: 'all 0.3s ease',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    Start Collaborating
                                    <FiChevronRight size={20} style={{ marginLeft: '8px' }} />
                                </Link>

                            </div>
                        </div>

                        {/* Hero Image */}
                        <div
                            style={{ display: 'flex', justifyContent: 'center' }}
                        >
                            <img
                                src={landing}
                                alt="ToggleNest Dashboard"
                                style={{
                                    width: '100%',
                                    maxWidth: '650px',
                                    borderRadius: '12px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* --- 3. Feature Grid Section --- */}
                <section
                    id="features"
                    className="feature-grid"
                    style={{
                        background: '#FFFFFF',
                        padding: '100px 50px',
                        marginBottom: '60px'
                    }}
                >
                    <h2
                        style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '80px', fontWeight: 800 }}
                    >
                        Simple tools for <span style={{ color: 'var(--color-primary-blue)' }}>powerful results</span>.
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', maxWidth: '1000px', margin: '0 auto' }}>
                        <FeatureItem
                            Icon={FiRefreshCw}
                            title="Instant Updates"
                            description="See changes immediately across all devices, so everyone is always working from the latest information."
                            colorName="primary-yellow"
                        />
                        <FeatureItem
                            Icon={FiColumns}
                            title="Flexible Task Boards"
                            description="Easily move tasks with drag-and-drop. Customize your workflow to fit exactly how your team operates."
                            colorName="accent-teal"
                        />
                        <FeatureItem
                            Icon={FiLock}
                            title="Secure Access"
                            description="Protect your project data with industry-leading security. Access is safe, simple, and reliable."
                            colorName="accent-red"
                        />
                        <FeatureItem
                            Icon={FiGrid}
                            title="Custom Dashboards"
                            description="Get a clear overview of your team's progress with customizable widgets and real-time reports."
                            colorName="accent-green"
                        />
                    </div>
                </section>

                {/* --- 5. Footer --- */}
                <footer
                    className="footer-section"
                    style={{
                        backgroundColor: '#FFFFFF',
                        borderTop: '1px solid #E5E7EB',
                        padding: '50px 50px',
                        color: 'var(--color-text-dark)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '0 auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={logo} alt="ToggleNest Logo" style={{ height: '60px', width: 'auto' }} />
                            <p style={{ color: 'var(--color-text-light)', marginLeft: '20px' }}>© 2025 ToggleNest, Inc. All rights reserved.</p>
                        </div>

                        <div style={{ display: 'flex', gap: '200px', fontSize: '17px', marginRight: "350px" }}>
                            <div>
                                <h5 style={{ marginBottom: '10px', fontWeight: 600 }}>Product</h5>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    <li><a href="#" className="footer-link">Features</a></li>
                                    <li><a href="#" className="footer-link">Pricing</a></li>
                                    <li><a href="#" className="footer-link">Roadmap</a></li>
                                </ul>
                            </div>
                            <div>
                                <h5 style={{ marginBottom: '10px', fontWeight: 600 }}>Company</h5>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    <li><a href="#" className="footer-link">About Us</a></li>
                                    <li><a href="#" className="footer-link">Support</a></li>
                                    <li><a href="#" className="footer-link">Legal</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default LandingPage;
