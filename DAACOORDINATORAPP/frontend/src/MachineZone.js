// MachineZone.js
import React from 'react';
import { useDrop } from 'react-dnd';

const ItemTypes = {
    PERSON: 'person',
};

function MachineZone({ machine, assigned, moveToMachine, testTime }) {
    const [{ isOver }, drop] = useDrop({
        accept: ItemTypes.PERSON,
        drop: (item) => {
            moveToMachine(item.person, machine);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    const getTimeLeft = (start, end) => {
        if (!testTime) return 'TBD';
        const test = new Date(`1970-01-01T${String(testTime.hours).padStart(2, '0')}:${String(testTime.minutes).padStart(2, '0')}:00Z`);
        const startTime = new Date(`1970-01-01T${start}Z`);
        let endTime = new Date(`1970-01-01T${end}Z`);
        if (endTime < startTime) endTime.setDate(endTime.getDate() + 1);

        const remainingSec = Math.max((endTime - test) / 1000, 0);
        const hrs = Math.floor(remainingSec / 3600);
        const mins = Math.floor((remainingSec % 3600) / 60);

        return `${hrs}H${mins}m`;
    };

    const getProgress = (start, end) => {
        if (!testTime) return 0;
        const test = new Date(`1970-01-01T${String(testTime.hours).padStart(2, '0')}:${String(testTime.minutes).padStart(2, '0')}:00Z`);
        const startTime = new Date(`1970-01-01T${start}Z`);
        let endTime = new Date(`1970-01-01T${end}Z`);
        if (endTime < startTime) endTime.setDate(endTime.getDate() + 1);

        const total = endTime - startTime;
        const elapsed = test - startTime;
        return Math.min(Math.max((elapsed / total) * 100, 0), 100);
    };

    return (
        <div ref={drop} className={`machine-zone-horizontal ${isOver ? 'hovered' : ''}`}>
            {assigned.map(p => (
                <div key={p.id} className="assigned-person detailed">
                    <div className="person-name">{p.name} {p.IDname}</div>
                    <div className="shift-time">{p.Shift_Start_Time} - {p.Shift_End_Time}</div>
                    <div className="time-remaining">Time Left: {getTimeLeft(p.Shift_Start_Time, p.Shift_End_Time)}</div>
                    <div className="progress-container">
                        <div
                            className="progress-bar"
                            style={{ width: `${getProgress(p.Shift_Start_Time, p.Shift_End_Time)}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default MachineZone;
