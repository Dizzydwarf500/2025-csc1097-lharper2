// OperationView.js (Horizontal Layout)
import React from 'react';
import './OperationView.css';
import { useDrop } from 'react-dnd';

const ItemTypes = {
    PRODUCT: 'product',
};

function OperationView({ onClose, onDuty, assignments, setAssignments }) {
    const machineNames = [
        'ATRS 13', 'ATRS 12', 'ATRS 11', 'ATRS 10', 'ATRS 9',
        'C3 8', 'C3 7', 'C3 6', 'C3 5', 'C3 4', 'C3 3', 'C3 2', 'C3 1'
    ];

    const moveToMachine = (person, machine) => {
        setAssignments((prev) => {
            const updated = { ...prev };
            // Remove from all machines first
            Object.keys(updated).forEach(m => {
                updated[m] = updated[m].filter(p => p.id !== person.id);
            });
            updated[machine] = [...updated[machine], person];
            return updated;
        });
    };

    return (
        <div className="operation-overlay">
            <div className="operation-content-horizontal">
                <button className="close-btn" onClick={onClose}>×</button>

                <div className="on-duty-sidebar">
                    <h3>On Duty</h3>
                    {onDuty.map(person => (
                        <div
                            key={person.id}
                            className="draggable-person"
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/json', JSON.stringify(person));
                            }}
                        >
                            {person.name} {person.IDname}
                        </div>
                    ))}
                </div>

                <div className="machines-scroll">
                    {machineNames.map(machine => {
                        const assigned = assignments[machine] || [];

                        const [{ isOver }, drop] = useDrop({
                            accept: ItemTypes.PRODUCT,
                            drop: (item, monitor) => {
                                const person = JSON.parse(monitor.getItem().person || JSON.stringify(item.product));
                                moveToMachine(person, machine);
                            },
                            collect: monitor => ({ isOver: monitor.isOver() }),
                        });

                        return (
                            <div
                                key={machine}
                                ref={drop}
                                className={`machine-zone-horizontal ${isOver ? 'hovered' : ''}`}
                            >
                                <h4>{machine}</h4>
                                {assigned.map(p => (
                                    <div className="assigned-person detailed" key={p.id}>
                                        <div className="person-name">{p.name} {p.IDname}</div>
                                        <div className="shift-time">{p.Shift_Start_Time} - {p.Shift_End_Time}</div>
                                        <div className="time-remaining">Time Left: TBD</div>
                                        <div className="progress-container">
                                            <div className="progress-bar" style={{ width: '50%' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default OperationView;
