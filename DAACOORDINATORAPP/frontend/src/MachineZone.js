// MachineZone.js
import React from 'react';
import { useDrop } from 'react-dnd';

const ItemTypes = {
    PRODUCT: 'product',
};

function formatTwo(val) {
    return String(val).padStart(2, '0');
}

function getRemainingTime(testTime, start, end) {
    if (!testTime || !start || !end) return 'TBD';

    const testClock = new Date(`1970-01-01T${formatTwo(testTime.hours)}:${formatTwo(testTime.minutes)}:00Z`);
    const shiftStart = new Date(`1970-01-01T${start}Z`);
    let shiftEnd = new Date(`1970-01-01T${end}Z`);

    if (shiftEnd < shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);

    const totalSeconds = Math.floor((shiftEnd - shiftStart) / 1000);
    const elapsedSeconds = Math.floor((testClock - shiftStart) / 1000);
    const remaining = Math.max(totalSeconds - elapsedSeconds, 0);

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    return `${hours}H${minutes}m`;
}

function calculateProgress(testTime, start, end) {
    if (!testTime || !start || !end) return 0;

    const now = new Date(`1970-01-01T${formatTwo(testTime.hours)}:${formatTwo(testTime.minutes)}:00Z`);
    const shiftStart = new Date(`1970-01-01T${start}Z`);
    let shiftEnd = new Date(`1970-01-01T${end}Z`);
    if (shiftEnd < shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);

    const total = shiftEnd - shiftStart;
    const elapsed = now - shiftStart;
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
}

const MachineZone = ({ machine, assigned, moveToMachine, testTime }) => {
    const [{ isOver }, drop] = useDrop({
        accept: ItemTypes.PRODUCT,
        drop: (item) => {
            moveToMachine(item, machine);
        },
        collect: monitor => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <div
            ref={drop}
            className={`machine-zone-horizontal ${isOver ? 'hovered' : ''}`}
        >
            {assigned.map(p => (
                <div className="assigned-person detailed" key={p.id}>
                    <div className="person-name">{p.name} {p.IDname}</div>
                    <div className="shift-time">{p.Shift_Start_Time} - {p.Shift_End_Time}</div>
                    <div className="time-remaining">
                        Time Left: {getRemainingTime(testTime, p.Shift_Start_Time, p.Shift_End_Time)}
                    </div>
                    <div className="progress-container">
                        <div
                            className="progress-bar"
                            style={{ width: `${calculateProgress(testTime, p.Shift_Start_Time, p.Shift_End_Time)}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MachineZone;
