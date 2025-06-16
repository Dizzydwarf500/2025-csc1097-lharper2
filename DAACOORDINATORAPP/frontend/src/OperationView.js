// OperationView.js code
import React from 'react';
import './OperationView.css';
import MachineZone from './MachineZone'; // 👈 Import child component

function OperationView({ onClose, onDuty, assignments, setAssignments }) {
    const machineNames = [
        'ATRS 13', 'ATRS 12', 'ATRS 11', 'ATRS 10', 'ATRS 9',
        'C3 8', 'C3 7', 'C3 6', 'C3 5', 'C3 4', 'C3 3', 'C3 2', 'C3 1'
    ];

    // Move a person to a machine (ensures removed from all others first)
    const moveToMachine = (person, machine) => {
        setAssignments((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((m) => {
                updated[m] = updated[m].filter(p => p.id !== person.id);
            });
            updated[machine] = [...(updated[machine] || []), person];
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
                    {machineNames.map(machine => (
                        <MachineZone
                            key={machine}
                            machine={machine}
                            assigned={assignments[machine] || []}
                            moveToMachine={moveToMachine}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default OperationView;
