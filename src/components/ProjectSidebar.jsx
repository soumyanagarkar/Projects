import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/CoreStyles.css';

const ProjectSidebar = ({ activeProjectId, projects, isMobileView }) => {
    // Mock projects list
    const mockProjects = [
        { id: 'projA', name: 'Q4 Marketing Strategy', isActive: true, taskCount: 4 },
        { id: 'projB', name: 'Togbility Update', isActive: false, taskCount: 2 },
        { id: 'projC', name: 'New Feature Launch', isActive: false, taskCount: 0 },
    ];

    return (
        <div className="project-sidebar" style={{ 
            width: isMobileView ? '100%' : '250px', 
            backgroundColor: 'var(--color-sidebar-bg)', 
            padding: '20px', 
            boxShadow: isMobileView ? 'none' : '2px 0 5px rgba(0,0,0,0.05)'
        }}>
            <h3 style={{marginBottom: '20px', color: 'var(--color-primary-blue)'}}>Dashboard</h3>
            
            <div className="project-list">
                <h4 style={{fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '10px'}}>Projects</h4>
                {mockProjects.map(project => (
                    <Link 
                        key={project.id} 
                        to={`/project/${project.id}`} 
                        style={{
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '10px', 
                            borderRadius: '8px', 
                            textDecoration: 'none', 
                            color: project.isActive ? 'white' : 'var(--color-text-dark)',
                            backgroundColor: project.isActive ? 'var(--color-primary-blue)' : 'transparent',
                            marginBottom: '5px',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <span>{project.name}</span>
                        <span style={{fontSize: '0.8rem', opacity: project.isActive ? 0.8 : 0.6}}>{project.taskCount}</span>
                    </Link>
                ))}
            </div>
            
            {/* Additional links for To-Do, Done, etc. as seen in the mobile view */}
            <div style={{marginTop: '30px'}}>
                 <h4 style={{fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '10px'}}>Views</h4>
                 <div style={{ padding: '10px', color: 'var(--color-text-dark)', borderRadius: '8px' }}>
                     To-Do Tasks
                 </div>
                 <div style={{ padding: '10px', color: 'var(--color-text-dark)', borderRadius: '8px' }}>
                     Completed
                 </div>
            </div>
        </div>
    );
};

export default ProjectSidebar;