// MachineZone.js code
import React from 'react';
import { useDrop } from 'react-dnd';

const ItemTypes = {
    PRODUCT: 'product',
};

const formatTwo = (val) => String(val).padStart(2, '0');

const getTimeLeft = (testTime, shiftEnd) => {
    if (!testTime || !shiftEnd) return 'N/A';

    const now = new Date(`1970-01-01T${formatTwo(testTime.hours)}:${formatTwo(testTime.minutes)}:00Z`);
    const end = new Date(`1970-01-01T${shiftEnd}Z`);
    if (end < now) end.setDate(end.getDate() + 1);

    const secondsLeft = Math.max((end - now) / 1000, 0);
    const hours = Math.floor(secondsLeft / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);

    return `${hours}H ${minutes}m`;
};

const getShiftProgress = (testTime, start, end) => {
    if (!testTime || !start || !end) return 0;

    const now = new Date(`1970-01-01T${formatTwo(testTime.hours)}:${formatTwo(testTime.minutes)}:00Z`);
    const shiftStart = new Date(`1970-01-01T${start}Z`);
    const shiftEnd = new Date(`1970-01-01T${end}Z`);
    if (shiftEnd < shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);

    const total = shiftEnd - shiftStart;
    const elapsed = now - shiftStart;
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
};

const MachineZone = ({ machine, assigned, moveToMachine, testTime }) => {
    const [{ isOver }, drop] = useDrop({
        accept: ItemTypes.PRODUCT,
        drop: (item) => {
            const person = item.product;
            moveToMachine(person, machine);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <div
            ref={drop}
            className={`machine-zone-horizontal ${isOver ? 'hovered' : ''}`}
        >
            <h4>{machine}</h4>
            {assigned.map(p => {
                const timeLeft = getTimeLeft(testTime, p.Shift_End_Time);
                const progress = getShiftProgress(testTime, p.Shift_Start_Time, p.Shift_End_Time);

                return (
                    <div className="assigned-person detailed" key={p.id}>
                        <div className="person-name">{p.name} {p.IDname}</div>
                        <div className="shift-time">{p.Shift_Start_Time} - {p.Shift_End_Time}</div>
                        <div className="time-remaining">Time Left: {timeLeft}</div>
                        <div className="progress-container">
                            <div className="progress-bar" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MachineZone;
