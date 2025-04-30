import React, { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './ProductList.css';
import { FaSort, FaChevronDown, FaChevronUp } from 'react-icons/fa';
const ItemTypes = {
  PRODUCT: 'product',

};


const getRemainingFromTestClock = (testTime, shiftStartTime, shiftEndTime) => {
  const testClock = new Date(`1970-01-01T${formatTwo(testTime.hours)}:${formatTwo(testTime.minutes)}:00Z`);
  const shiftStart = new Date(`1970-01-01T${shiftStartTime}Z`);
  const shiftEnd = new Date(`1970-01-01T${shiftEndTime}Z`);

  // Handle overnight shifts
  if (shiftEnd < shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);

  // Always compare against Shift_Start
  const totalDurationSeconds = (shiftEnd - shiftStart) / 1000;
  const testClockSeconds = (testClock - shiftStart) / 1000;

  const remaining = Math.max(Math.floor(totalDurationSeconds - testClockSeconds), 0);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);

  return `${hours}H${minutes}m`;
};
// Function to format the date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { weekday: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};
const calculateShiftProgress = (testTime, start, end) => {
  if (!testTime) return 0;

  // Make sure time zone is correct
  const now = new Date(`1970-01-01T${formatTwo(testTime.hours)}:${formatTwo(testTime.minutes)}:00Z`);
  const shiftStart = new Date(`1970-01-01T${start}Z`);
  let shiftEnd = new Date(`1970-01-01T${end}Z`);

  if (shiftEnd < shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);

  const total = shiftEnd - shiftStart;
  const elapsed = now - shiftStart;
  const percent = Math.min(Math.max((elapsed / total) * 100, 0), 100);

  return percent.toFixed(2);
};
const getRemainingSeconds = (testTime, start, end) => {
  const adjustedHours = testTime.hours - 1 < 0 ? 23 : testTime.hours + 1;
  const now = new Date(`1970-01-01T${formatTwo(adjustedHours)}:${formatTwo(testTime.minutes)}:00`);
  const shiftStart = new Date(`1970-01-01T${start}Z`);
  let shiftEnd = new Date(`1970-01-01T${end}Z`);

  if (shiftEnd < shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);
  return Math.max((shiftEnd - now) / 1000, 0);
};


// Function to generate time options up to 10 minutes ahead in 1-minute intervals
const generateTimeOptions = (testTime) => {
  let now;

  if (testTime) {
    const adjustedHours = testTime.hours - 1 < 0 ? 23 : testTime.hours - 0;
    now = new Date(`1970-01-01T${String(adjustedHours).padStart(2, '0')}:${String(testTime.minutes).padStart(2, '0')}:00`);
  } else {
    now = new Date();
  }

  const options = [];
  for (let i = 0; i <= 10; i++) {
    const optionTime = new Date(now.getTime() + i * 60000);
    options.push(optionTime.toTimeString().slice(0, 5));
  }

  return options;
};
const getBreakTimeDisplay = (currentTestTime, breakStartTestTime, breakDuration) => {
  if (!currentTestTime || !breakStartTestTime || breakDuration == null) return null;

  const startSeconds = breakStartTestTime.hours * 3600 + breakStartTestTime.minutes * 60;
  const currentSeconds = currentTestTime.hours * 3600 + currentTestTime.minutes * 60;
  const elapsed = currentSeconds - startSeconds;
  const remaining = breakDuration - elapsed;

  const absRemaining = Math.abs(remaining);
  const minutes = Math.floor(absRemaining / 60);
  const seconds = String(absRemaining % 60).padStart(2, '0');

  return remaining >= 0
    ? `Time left: ${minutes}:${seconds}`
    : `Over by: ${minutes}:${seconds}`;
};

const formatTwo = (val) => String(val).padStart(2, '0');
// Calculate the difference in minutes between the current time and selected time
const calculateAdditionalMinutes = (selectedTime) => {
  const now = new Date();
  const [selectedHour, selectedMinute] = selectedTime.split(':').map(Number);
  const selectedDate = new Date(now);
  selectedDate.setHours(selectedHour, selectedMinute, 0, 0);

  const differenceInMinutes = Math.round((selectedDate - now) / (1000 * 60));
  return differenceInMinutes > 0 ? differenceInMinutes : 0;
};

// BreakPopup Component with Time Selection
const BreakPopup = ({ message, onClose, onConfirm, testTime, isFinish, cancelClickedRef }) => {
  const timeOptions = generateTimeOptions(testTime);
  const [selectedTime, setSelectedTime] = useState(timeOptions[0]);

  return (
    <div className="break-popup">
      <div className="break-popup-content">
        <h2 className="break-popup-message">{message}</h2>

        {!isFinish && (
          <select
            id="time-select"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        )}

        <button onClick={() => onConfirm(isFinish ? null : selectedTime)}>Confirm</button>
        <button
          onClick={() => {
            cancelClickedRef.current = true;
            onClose();
          }}
        >
          Cancel
        </button>

      </div>
    </div>
  );
};

// Draggable Product Component
const DraggableProduct = ({ product, index, sectionId, testTime, moveProduct, staffProducts, vipProducts, autoPassProducts, FastTrackProducts, QMProducts, SweepProducts }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.PRODUCT,
    item: { index, sectionId, product, origin: "ProductList" },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Countdown message only in the "On Break" section
  const displayTime =
    sectionId === "On Break" && product.breakStartTestTime && product.breakDuration
      ? getBreakTimeDisplay(testTime, product.breakStartTestTime, product.breakDuration)
      : null;

  return (
    <div
      ref={drag}
      className="draggable-product"
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.1s ease, box-shadow 0.1s ease',
        boxShadow: isDragging ? '0px 8px 16px rgba(0, 0, 0, 0.2)' : '0px 4px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="product-date">
        <div className="product-day">{formatDate(product.Shift_Start_Date)}</div>
      </div>
      <div className="product-info">
        <h3>
          {product.name} {product.IDname}
          {staffProducts?.some((p) => p.id === product.id) && (
            <span style={{ color: 'blue', marginLeft: '6px', fontWeight: 'bold' }}>S</span>
          )}
          {vipProducts?.some((p) => p.id === product.id) && (
            <span style={{ color: '#b266ff', marginLeft: '6px', fontWeight: 'bold' }}>V</span>
          )}
          {autoPassProducts?.some((p) => p.id === product.id) && (
            <span style={{ color: 'orange', marginLeft: '6px', fontWeight: 'bold' }}>A</span>
          )}
          {FastTrackProducts?.some((p) => p.id === product.id) && (
            <span style={{ color: 'purple', marginLeft: '6px', fontWeight: 'bold' }}>F</span>
          )}
          {QMProducts?.some((p) => p.id === product.id) && (
            <span style={{ color: '#66ccff', marginLeft: '6px', fontWeight: 'bold' }}>QM</span>
          )}
          {SweepProducts?.some((p) => p.id === product.id) && (
            <span style={{ color: '#66ff99', marginLeft: '6px', fontWeight: 'bold' }}>SW</span>
          )}
        </h3>




        <div style={{ width: '100%' }}>
          <p>
            {product.Shift_Start_Time} - {product.Shift_End_Time} (
            {testTime
              ? getRemainingFromTestClock(testTime, product.Shift_Start_Time, product.Shift_End_Time)
              : calculateShiftDuration(product.Shift_Start_Time, product.Shift_End_Time)}
            )
          </p>
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{
                width: `${calculateShiftProgress(testTime, product.Shift_Start_Time, product.Shift_End_Time)}%`,
                backgroundColor:
                  getRemainingSeconds(testTime, product.Shift_Start_Time, product.Shift_End_Time) <= 1800
                    ? '#ff4d4f'
                    : '#4caf50',
              }}
            />
          </div>
        </div>

        {displayTime && <p className="timer">{displayTime}</p>}
        {product.finishedCount > 0 && (
          <div className="checkmarks">
            {Array.from({ length: product.finishedCount }, (_, i) => (
              <span key={i} className="checkmark">✔️</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to calculate shift duration
const calculateShiftDuration = (startTime, endTime) => {
  const start = new Date(`1970-01-01T${startTime}Z`);
  let end = new Date(`1970-01-01T${endTime}Z`);

  if (end < start) {
    end.setDate(end.getDate() + 1);
  }

  const diff = (end - start) / (1000 * 60);
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  return `${hours}H${minutes}m`;
};

// Droppable Section Component with Drop Effects
const DroppableSection = ({
  id,
  products,
  moveProduct,
  staffProducts,
  vipProducts,
  autoPassProducts,
  FastTrackProducts,
  QMProducts,
  SweepProducts,
  testTime,
}) => {
  const [sortBy, setSortBy] = useState('name');
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [showSortPanel, setShowSortPanel] = useState(false);


  const countOccurrences = (list, key) => {
    return list.reduce((acc, item) => {
      const val = item[key];
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
  };

  const startTimeCounts = countOccurrences(products, 'Shift_Start_Time');
  const endTimeCounts = countOccurrences(products, 'Shift_End_Time');

  const uniqueStartTimes = [...new Set(products.map(p => p.Shift_Start_Time))].sort();
  const uniqueEndTimes = [...new Set(products.map(p => p.Shift_End_Time))].sort();

  const getSortedProducts = () => {
    const sorted = [...products];

    if (sortBy === 'name') {
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'Shift_Start_Time') {
      return sorted.sort((a, b) => {
        if (a.Shift_Start_Time === selectedStartTime && b.Shift_Start_Time !== selectedStartTime) return -1;
        if (b.Shift_Start_Time === selectedStartTime && a.Shift_Start_Time !== selectedStartTime) return 1;
        return a.Shift_Start_Time.localeCompare(b.Shift_Start_Time);
      });
    } else if (sortBy === 'Shift_End_Time') {
      return sorted.sort((a, b) => {
        if (a.Shift_End_Time === selectedEndTime && b.Shift_End_Time !== selectedEndTime) return -1;
        if (b.Shift_End_Time === selectedEndTime && a.Shift_End_Time !== selectedEndTime) return 1;
        return a.Shift_End_Time.localeCompare(b.Shift_End_Time);
      });
    }

    return sorted;
  };

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.PRODUCT,
    drop: (item) => {
      if (id === 'On Break' && item.origin === 'PopoutMenu') return;
      if (['On Duty', 'On Break', 'Finished'].includes(id)) {
        moveProduct(item.product, item.sectionId, id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} className={`droppable-section ${isOver ? 'droppable-section-hover' : ''}`}>
      <div className="section-header">
        <div className="section-title-wrapper">
          <h2 className="section-title">{id}</h2>
          {id === 'On Duty' && (
            <button className="sort-toggle" onClick={() => setShowSortPanel(!showSortPanel)}>
              <FaSort className="sort-icon" />
              {showSortPanel ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          )}
        </div>
      </div>

      {/* Conditionally visible sorting controls */}
      {showSortPanel && id === 'On Duty' && (
        <div className="sorting-controls">
          <label className="sort-label">Sort by:</label>
          <div className="sort-options">
            <select
              className="sort-select"
              onChange={(e) => setSortBy(e.target.value)}
              value={sortBy}
            >
              <option value="name">Name</option>
              <option value="Shift_Start_Time">Shift Start Time</option>
              <option value="Shift_End_Time">Shift End Time</option>
            </select>

            {sortBy === 'Shift_Start_Time' && (
              <select
                className="time-select"
                value={selectedStartTime}
                onChange={(e) => setSelectedStartTime(e.target.value)}
              >
                <option value="">-- All Times --</option>
                {uniqueStartTimes.map((time) => (
                  <option key={time} value={time}>
                    {time} ({startTimeCounts[time] || 0})
                  </option>
                ))}
              </select>
            )}

            {sortBy === 'Shift_End_Time' && (
              <select
                className="time-select"
                value={selectedEndTime}
                onChange={(e) => setSelectedEndTime(e.target.value)}
              >
                <option value="">-- All Times --</option>
                {uniqueEndTimes.map((time) => (
                  <option key={time} value={time}>
                    {time} ({endTimeCounts[time] || 0})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      <TransitionGroup className="product-list">
        {getSortedProducts().map((product, index) => (
          <CSSTransition key={product.id} timeout={1} classNames="fade">
            <DraggableProduct
              key={product.id}
              product={product}
              index={index}
              sectionId={id}
              moveProduct={moveProduct}
              staffProducts={staffProducts}
              autoPassProducts={autoPassProducts}
              vipProducts={vipProducts}
              FastTrackProducts={FastTrackProducts}
              QMProducts={QMProducts}
              SweepProducts={SweepProducts}
              testTime={testTime}
            />
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  );
};




const ProductList = ({
  rollcallProducts,
  onDutyProducts,
  setOnDutyProducts,
  onBreakProducts,
  setOnBreakProducts,
  finishedProducts,
  setFinishedProducts,
  staffProducts,
  setStaffProducts,
  vipProducts,
  autoPassProducts,
  FastTrackProducts,
  QMProducts,
  SweepProducts,
  testTime
}) => {
  const [showBreakPopup, setShowBreakPopup] = useState(false);
  const [breakPopupMessage, setBreakPopupMessage] = useState('');
  const [currentProduct, setCurrentProduct] = useState(null);
  const cancelClickedRef = useRef(false);
  const triggerBreakPopup = (product) => {
    setCurrentProduct(product);

    const isShortShift = (() => {
      const start = new Date(`1970-01-01T${product.Shift_Start_Time}Z`);
      let end = new Date(`1970-01-01T${product.Shift_End_Time}Z`);
      if (end < start) end.setDate(end.getDate() + 1);
      const diffMinutes = (end - start) / (1000 * 60);
      return diffMinutes < 390; // 6.5 hours
    })();

    const shouldFinish = product.finishedCount === 2 || (product.finishedCount === 1 && isShortShift);

    if (shouldFinish) {
      setBreakPopupMessage(`Finish ${product.name} ${product.IDname}'s shift?`);
      setShowBreakPopup('finish');
    } else {
      setBreakPopupMessage(`What time to start break for ${product.name}?`);
      setShowBreakPopup('break');
    }
  };


  const handlePopupConfirm = (selectedTime) => {
    if (showBreakPopup === 'finish') {
      setOnBreakProducts((prev) => prev.filter((p) => p.id !== currentProduct.id));
    } else {
      const [selHour, selMinute] = selectedTime.split(':').map(Number);
      const breakStartSeconds = selHour * 3600 + selMinute * 60;
      const currentSeconds = testTime.hours * 3600 + testTime.minutes * 60;
      const delaySeconds = Math.max(breakStartSeconds - currentSeconds, 0);

      let baseMinutes;
      const start = new Date(`1970-01-01T${currentProduct.Shift_Start_Time}Z`);
      let end = new Date(`1970-01-01T${currentProduct.Shift_End_Time}Z`);
      if (end < start) end.setDate(end.getDate() + 1);
      const shiftMinutes = (end - start) / (1000 * 60);

      // Logic:
      if (currentProduct.finishedCount === 1) {
        baseMinutes = 30;
      } else if (currentProduct.finishedCount === 2) {
        baseMinutes = 0;
      } else {
        baseMinutes = 40; // default for first break
      }

      const totalTimerSeconds = (baseMinutes * 60) + delaySeconds;

      const updatedProduct = {
        ...currentProduct,
        breakStartTestTime: testTime,
        breakDuration: totalTimerSeconds,
      };

      setOnBreakProducts((prev) =>
        [...prev.filter((p) => p.id !== updatedProduct.id), updatedProduct].sort((a, b) => a.name.localeCompare(b.name))
      );
    }

    setShowBreakPopup(false);
  };

  const moveProduct = (product, sourceSectionId, targetSectionId) => {
    const sections = {
      'On Duty': { list: onDutyProducts, setList: setOnDutyProducts },
      'On Break': { list: onBreakProducts, setList: setOnBreakProducts },
      'Finished': { list: finishedProducts, setList: setFinishedProducts },
    };

    const sourceList = sections[sourceSectionId]?.list || [];
    const setSourceList = sections[sourceSectionId]?.setList;
    const targetList = sections[targetSectionId].list;
    const setTargetList = sections[targetSectionId].setList;

    if (setSourceList) {
      const newSourceList = sourceList.filter((p) => p.id !== product.id);
      setSourceList(newSourceList);
    }

    const now = new Date();

    let timerStartedAt =
      targetSectionId === "On Duty" && !product.timerStartedAt
        ? now.toISOString()
        : product.timerStartedAt;

    let timer = product.timer;

    if (targetSectionId === "On Duty" && !product.timerStartedAt) {
      const shiftStart = new Date(`1970-01-01T${product.Shift_Start_Time}Z`);
      const shiftEnd = new Date(`1970-01-01T${product.Shift_End_Time}Z`);

      // Handle overnight shifts
      if (shiftEnd < shiftStart) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
      }

      const totalDuration = Math.floor((shiftEnd - shiftStart) / 1000);
      const elapsed = Math.floor((now - shiftStart) / 1000);
      timer = Math.max(totalDuration - elapsed, 0);
    }

    const newTargetList = [
      ...targetList,
      {
        ...product,
        timerStartedAt,
        timer,
        finishedCount:
          targetSectionId === "Finished"
            ? (product.finishedCount || 0) + 1
            : product.finishedCount,
      },
    ].sort((a, b) => a.name.localeCompare(b.name));


    setTargetList(newTargetList);

    if (targetSectionId === 'On Break') {
      triggerBreakPopup(product);
    }
  };

  return (
    <div className="container">
      <DroppableSection
        id="On Duty"
        products={onDutyProducts}
        moveProduct={moveProduct}
        staffProducts={staffProducts}
        vipProducts={vipProducts}
        autoPassProducts={autoPassProducts}
        FastTrackProducts={FastTrackProducts}
        QMProducts={QMProducts}
        SweepProducts={SweepProducts}
        testTime={testTime}
      />
      <DroppableSection
        id="On Break"
        products={onBreakProducts}
        moveProduct={moveProduct}
        staffProducts={staffProducts}
        vipProducts={vipProducts}
        autoPassProducts={autoPassProducts}
        FastTrackProducts={FastTrackProducts}
        QMProducts={QMProducts}
        SweepProducts={SweepProducts}
        testTime={testTime}
      />
      <DroppableSection
        id="Finished"
        products={finishedProducts}
        moveProduct={moveProduct}
        staffProducts={staffProducts}
        vipProducts={vipProducts}
        autoPassProducts={autoPassProducts}
        FastTrackProducts={FastTrackProducts}
        QMProducts={QMProducts}
        SweepProducts={SweepProducts}
        testTime={testTime}
      />

      {showBreakPopup && (
        <BreakPopup
          message={breakPopupMessage}
          onClose={() => {
            if (cancelClickedRef.current && currentProduct) {
              setOnBreakProducts((prev) => prev.filter((p) => p.id !== currentProduct.id));
              setOnDutyProducts((prev) =>
                [...prev, currentProduct].sort((a, b) => a.name.localeCompare(b.name))
              );
            }
            setShowBreakPopup(false);
            cancelClickedRef.current = false;
          }}
          cancelClickedRef={cancelClickedRef}
          onConfirm={handlePopupConfirm}
          testTime={testTime}
          isFinish={showBreakPopup === 'finish'}
        />

      )}
    </div>
  );
};

export default ProductList;
