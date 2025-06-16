// DraggablePerson.js
import React from 'react';
import { useDrag } from 'react-dnd';

const ItemTypes = {
    PRODUCT: 'product',
};

const DraggablePerson = ({ person }) => {
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.PRODUCT,
        item: { product: person },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={drag}
            className="draggable-person"
            style={{
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
            }}
        >
            {person.name} {person.IDname}
        </div>
    );
};
//Export
export default DraggablePerson;
