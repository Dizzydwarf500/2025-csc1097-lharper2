import React from 'react';
import { useDrag } from 'react-dnd';

const ItemTypes = {
    PERSON: 'person',
};

function DraggablePerson({ person }) {
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
            {person.name} {person.IDname}
        </div>
    );
}

export default DraggablePerson;