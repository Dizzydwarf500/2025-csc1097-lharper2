import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import './OperationView.css';

const ItemTypes = { PERSON: 'person' };

const formatTwo = (val) => String(val).padStart(2, '0');

const getRemainingFromTestClock = (testTime, shiftStartTime, shiftEndTime) => {
    const testClock = new Date(`1970-01-01T${formatTwo(testTime.hours)}:${formatTwo(testTime.minutes)}:00Z`);
    const shiftStart = new Date(`1970-01-01T${shiftStartTime}Z`);
    const shiftEnd = new Date(`1970-01-01T${shiftEndTime}Z`);
    if (shiftEnd < shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);
    const totalDurationSeconds = (shiftEnd - shiftStart) / 1000;
    const testClockSeconds = (testClock - shiftStart) / 1000;
    const remaining = Math.max(Math.floor(totalDurationSeconds - testClockSeconds), 0);
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    return `${hours}H${minutes}m`;
};

const calculateShiftProgress = (testTime, start, end) => {
    const now = new Date(`1970-01-01T${formatTwo(testTime.hours)}:${formatTwo(testTime.minutes)}:00Z`);
    const shiftStart = new Date(`1970-01-01T${start}Z`);
    let shiftEnd = new Date(`1970-01-01T${end}Z`);
    if (shiftEnd < shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);
    const total = shiftEnd - shiftStart;
    const elapsed = now - shiftStart;
    const percent = Math.min(Math.max((elapsed / total) * 100, 0), 100);
    return percent.toFixed(2);
};

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

const DropZone = ({ name, assigned, onDropPerson, onRemove, testTime }) => {
    const [{ isOver }, drop] = useDrop({
        accept: ItemTypes.PERSON,
        drop: (item) => onDropPerson(name, item.person),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <div ref={drop} className={`machine-zone ${isOver ? 'hovered' : ''}`}>
            <h3>{name}</h3>
            {assigned.map((p) => (
                <div key={p.id} className="assigned-person detailed">
                    <div className="person-name">{p.name} ({p.IDname})</div>
                    <div className="shift-time">{p.Shift_Start_Time} - {p.Shift_End_Time}</div>
                    <div className="time-remaining">
                        {testTime ? getRemainingFromTestClock(testTime, p.Shift_Start_Time, p.Shift_End_Time) : ''}
                    </div>
                    <div className="progress-container">
                        <div
                            className="progress-bar"
                            style={{
                                width: `${calculateShiftProgress(testTime, p.Shift_Start_Time, p.Shift_End_Time)}%`,
                                backgroundColor: '#4caf50'
                            }}
                        ></div>
                    </div>
                    {/* Optional Unassign Button */}
                    {/* <button className="remove-btn" onClick={() => onRemove(name, p.id)}>✖</button> */}
                </div>
            ))}
        </div>
    );
};

const OperationView = ({ onClose, onDuty, assignments, setAssignments, testTime }) => {
    const handleDrop = (machine, person) => {
        setAssignments((prev) => {
            const alreadyAssigned = Object.values(prev).some((list) =>
                list.some((p) => p.id === person.id)
            );
            if (alreadyAssigned) return prev;

            const updated = { ...prev };
            updated[machine] = [...updated[machine], person];
            return updated;
        });
    };

    const handleRemove = (machine, personId) => {
        setAssignments((prev) => {
            const updated = { ...prev };
            updated[machine] = updated[machine].filter((p) => p.id !== personId);
            return updated;
        });
    };

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

                    <div className="machines-column">
                        {Object.keys(assignments).map((machine) => (
                            <DropZone
                                key={machine}
                                name={machine}
                                assigned={assignments[machine]}
                                onDropPerson={handleDrop}
                                onRemove={handleRemove}
                                testTime={testTime}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationView;
