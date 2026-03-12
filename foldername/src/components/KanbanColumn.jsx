import React from 'react';
import KanbanTaskCard from './KanbanTaskCard';

const KanbanColumn = ({ title, status, tasks = [], handleDrop, onDeleteTask }) => {
    
    const onDragOver = (e) => {
        e.preventDefault(); 
    };

    const onDrop = (e) => {
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            handleDrop(taskId, status);
        }
    };

    // Ensure tasks is always an array to prevent .length or .map errors
    const safeTasks = Array.isArray(tasks) ? tasks : [];

    return (
        <div 
            onDragOver={onDragOver}
            onDrop={onDrop}
            className="kanban-column"
            style={{
                backgroundColor: '#EDF2F7',
                borderRadius: '12px',
                width: '320px',
                minHeight: '500px',
                display: 'flex',
                flexDirection: 'column',
                padding: '15px',
                transition: 'background-color 0.2s ease'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 5px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2D3748', margin: 0 }}>
                    {/* Ensure title is a string */}
                    {String(title)}
                </h3>
                <span style={{ backgroundColor: '#CBD5E0', color: '#4A5568', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {safeTasks.length}
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
                {safeTasks.map(task => (
                    // Only render the card if the task object exists and has an ID
                    task && (task._id || task.id) ? (
                        <KanbanTaskCard 
                            key={task._id || task.id} 
                            task={task} 
                            onDeleteTask={onDeleteTask} 
                        />
                    ) : null
                ))}
            </div>
            
            {safeTasks.length === 0 && (
                <div style={{ border: '2px dashed #CBD5E0', borderRadius: '8px', padding: '20px', textAlign: 'center', color: '#A0AEC0', fontSize: '0.85rem', marginTop: '10px' }}>
                    No tasks yet
                </div>
            )}
        </div>
    );
};

export default KanbanColumn;