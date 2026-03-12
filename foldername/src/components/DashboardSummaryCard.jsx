import React from 'react';
import '../styles/CoreStyles.css';

const DashboardSummaryCard = ({ title, count, description, color, avatarCount, icon }) => {
    const colorVar = `var(--color-${color})`;

    const cardStyle = {
        backgroundColor: 'var(--color-bg-canvas)', 
        borderLeft: `4px solid ${colorVar}`, 
        padding: '25px',
        minHeight: '140px', 
    };

    const countStyle = {
        color: colorVar,
        fontSize: '2.5rem',
        fontWeight: '700',
        marginBottom: '5px',
    };

    return (
        <div className="summary-card card-container" style={cardStyle}>
            <div className="summary-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h4 style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h4>
                <span style={{color: colorVar, fontSize: '1.2rem'}}>{icon}</span> 
            </div>
            
            <p className="summary-count" style={countStyle}>{count}</p>
            
            <div className="summary-details" style={{marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #F0F0F0'}}>
                <span className="summary-description" style={{color: 'var(--color-text-light)', fontSize: '0.85rem'}}>{description}</span>
                <div className="avatar-group">
                    {Array.from({ length: avatarCount }).map((_, i) => (
                        <div 
                            key={i} 
                            style={{
                                width: '22px', 
                                height: '22px', 
                                borderRadius: '50%', 
                                backgroundColor: colorVar, 
                                display: 'inline-block', 
                                marginLeft: i > 0 ? '-6px' : '0', 
                                border: '2px solid white', 
                                zIndex: avatarCount - i
                            }}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardSummaryCard;