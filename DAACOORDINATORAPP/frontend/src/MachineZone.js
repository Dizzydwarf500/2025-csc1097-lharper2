// MachineZone.js
import React from 'react';
import { useDrop } from 'react-dnd';

const ItemTypes = {
    PRODUCT: 'product',
};

const MachineZone = ({ machine, assigned, moveToMachine }) => {
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
};

export default MachineZone;
