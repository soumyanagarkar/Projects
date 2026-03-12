import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSettings, FiSave, FiUser, FiGlobe } from 'react-icons/fi';
import { DARK_NAVY, BACKGROUND_IVORY, ACCENT_TEAL } from '../color-constants';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = React.useState('light');

    const handleSaveChanges = () => {
        console.log("[Action] Settings saved.");
        alert("Settings saved successfully!");
    };
    
    const handleThemeChange = (e) => {
        setTheme(e.target.value);
        console.log(`[Action] Theme changed to: ${e.target.value}`);
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: BACKGROUND_IVORY }}>
            <div style={{ padding: '50px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: DARK_NAVY }}>
                        <FiSettings size={32} style={{ marginRight: '15px', verticalAlign: 'middle', color: ACCENT_TEAL }} />
                        Application Settings
                    </h1>
                </header>
                
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                    
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: DARK_NAVY, marginBottom: '20px', borderBottom: '1px solid #E5E7EB', paddingBottom: '10px' }}>
                        <FiUser size={20} style={{ marginRight: '10px' }} />
                        Account Preferences
                    </h2>
                    <div style={{ marginBottom: '30px', paddingLeft: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: DARK_NAVY }}>Email Notifications</label>
                        <input type="checkbox" defaultChecked style={{ transform: 'scale(1.2)' }} />
                        <span style={{ marginLeft: '10px', color: '#6B7280' }}>Receive important updates.</span>
                    </div>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: DARK_NAVY, marginBottom: '20px', borderBottom: '1px solid #E5E7EB', paddingBottom: '10px' }}>
                        <FiGlobe size={20} style={{ marginRight: '10px' }} />
                        Display Settings
                    </h2>
                    <div style={{ marginBottom: '30px', paddingLeft: '15px' }}>
                        <label htmlFor="theme-select" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: DARK_NAVY }}>Application Theme</label>
                        <select 
                            id="theme-select"
                            value={theme}
                            onChange={handleThemeChange}
                            style={{ padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                        >
                            <option value="light">Light Mode</option>
                            <option value="dark">Dark Mode (Future)</option>
                            <option value="system">System Default</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleSaveChanges}
                        style={{ 
                            padding: '12px 30px', 
                            backgroundColor: ACCENT_TEAL, 
                            color: 'white', 
                            fontWeight: 700, 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '1.05rem',
                            marginTop: '30px'
                        }}
                    >
                        <FiSave size={20} style={{ marginRight: '8px' }} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;