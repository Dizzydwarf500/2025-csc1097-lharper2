import React from 'react';
import './OperationView.css';
import MachineZone from './MachineZone';
import DraggablePerson from './DraggablePerson';

function OperationView({ onClose, onDuty, assignments, setAssignments, testTime }) {
    const topMachines = ['C3 1', 'C3 2', 'C3 3', 'C3 4', 'C3 5', 'C3 6'];
    const bottomMachines = ['C3 7', 'C3 8', 'ATRS 9', 'ATRS 10', 'ATRS 11', 'ATRS 12', 'ATRS 13'];

    const moveToMachine = (person, machine) => {
        setAssignments(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(m => {
                updated[m] = updated[m].filter(p => p.id !== person.id);
            });
            updated[machine] = [...(updated[machine] || []), person];
            return updated;
        });
    };

    const renderMachineRow = (machineList) => (
        <div className="machine-row">
            {machineList.map(machine => (
                <div className="machine-wrapper" key={machine}>
                    <div className="machine-visual">
                        <div className="machine-top-bar">{machine}</div>
                        <div className="machine-body" />
                    </div>
                    <MachineZone
                        machine={machine}
                        assigned={assignments[machine] || []}
                        moveToMachine={moveToMachine}
                        testTime={testTime}
                    />
                </div>
            ))}
        </div>
    );

    return (
        <div className="operation-overlay">
            <div className="operation-content-horizontal">
                <button className="close-btn" onClick={onClose}>×</button>

                <div className="on-duty-sidebar">
                    <h3>On Duty</h3>
                    {onDuty.map(person => (
                        <DraggablePerson key={person.id} person={person} />
                    ))}
                </div>

                <div className="machines-column">
                    {renderMachineRow(topMachines)}
                    {renderMachineRow(bottomMachines)}
                </div>
            </div>
        </div>
    );
}

export default OperationView;
