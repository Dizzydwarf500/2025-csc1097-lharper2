import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import './OperationView.css';

const ItemTypes = { PERSON: 'person' };

const DraggablePerson = ({ person }) => {
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.PERSON,
        item: { person },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={drag}
            className="draggable-person"
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            {person.name} ({person.IDname})
        </div>
    );
};

const DropZone = ({ name, assigned, onDropPerson }) => {
    const [{ isOver }, drop] = useDrop({
        accept: ItemTypes.PERSON,
        drop: (item) => onDropPerson(name, item.person),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <div ref={drop} className={`machine-zone ${isOver ? 'hovered' : ''}`}>
            <h4>{name}</h4>
            {assigned.map((p) => (
                <div key={p.id} className="assigned-person">
                    {p.name} ({p.IDname})
                </div>
            ))}
        </div>
    );
};

const OperationView = ({ onClose, onDuty, assignments, setAssignments }) => {
    const handleDrop = (machine, person) => {
        setAssignments((prev) => {
            const newAssignments = { ...prev };
            if (!newAssignments[machine].some(p => p.id === person.id)) {
                newAssignments[machine] = [...newAssignments[machine], person];
            }
            return newAssignments;
        });
    };

    const machines = [
        'C3 1', 'C3 2', 'C3 3', 'C3 4', 'C3 5', 'C3 6', 'C3 7', 'C3 8',
        'ATRS 9', 'ATRS 10', 'ATRS 11', 'ATRS 12', 'ATRS 13'
    ];

    return (
        <div className="operation-overlay">
            <div className="operation-content">
                <button className="close-btn" onClick={onClose}>X</button>
                <h2>Operation View – Assign Staff to Machines</h2>

                <div className="operation-columns">
                    <div className="on-duty-column">
                        <h3>On Duty</h3>
                        {onDuty.map((p) => (
                            <DraggablePerson key={p.id} person={p} />
                        ))}
                    </div>

                    <div className="machines-grid">
                        {machines.map((machine) => (
                            <DropZone
                                key={machine}
                                name={machine}
                                assigned={assignments[machine] || []}
                                onDropPerson={handleDrop}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationView;
