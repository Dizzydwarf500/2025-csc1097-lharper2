import React, { useState, useEffect } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import './PopoutMenu.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';

const ItemTypes = {
  PRODUCT: 'product',
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { weekday: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

const PopoutMenu = ({
  rollcallProducts,
  moveToOnDuty,
  staffSedProducts,
  addToStaff,
  removeFromStaff,
  vipProducts,
  addToVIP,
  removeFromVIP,
  autoPassProducts,
  addToAutoPass,
  removeFromAutoPass,
  FastTrackProducts,
  addToFastTrack,
  removeFromFastTrack,
  QMProducts,
  addToQM,
  removeFromQM,
  SweepProducts,
  addToSweep,
  removeFromSweep,
  testTime,
  finishedProducts,
  onDutyProducts = [],
  onBreakProducts = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRollcallOpen, setIsRollcallOpen] = useState(false);
  const [isStaffExtended, setIsStaffExtended] = useState(false);
  const [isVIPExtended, setIsVIPExtended] = useState(false);
  const [isAutoPassExtended, setIsAutoPassExtended] = useState(false);
  const [isFastTrackExtended, setIsFastTrackExtended] = useState(false);
  const [isQMExtended, setIsQMExtended] = useState(false);
  const [isSweepExtended, setIsSweepExtended] = useState(false);
  const [rollcallNotificationCount, setRollcallNotificationCount] = useState(0);
  const [showNewRollcallPopup, setShowNewRollcallPopup] = useState(false);
  const totalStaff = onDutyProducts.length + onBreakProducts.length;

  useEffect(() => {
    const nowMinutes = testTime
      ? testTime.hours * 60 + testTime.minutes
      : new Date().getHours() * 60 + new Date().getMinutes();
    {/* Code for notifcations */ }
    const matchingItems = rollcallProducts.filter((product) => {
      const [startHour, startMinute] = product.Shift_Start_Time.split(':').map(Number);
      const shiftMinutes = startHour * 60 + startMinute;
      const isWithinTime = nowMinutes >= shiftMinutes && nowMinutes < shiftMinutes + 10;
      const alreadyOnDuty = onDutyProducts.some((p) => p.id === product.id);
      return isWithinTime && !alreadyOnDuty;
    });


    if (matchingItems.length !== rollcallNotificationCount) {
      setRollcallNotificationCount(matchingItems.length);
      if (matchingItems.length > 0) {
        setShowNewRollcallPopup(true);
        setTimeout(() => setShowNewRollcallPopup(false), 4000);
      }
    }
  }, [rollcallProducts, testTime, rollcallNotificationCount]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleRollcallPopup = () => {
    setIsRollcallOpen(!isRollcallOpen);
    setRollcallNotificationCount(0);
    setShowNewRollcallPopup(false);
  };

  const toggleStaffExtension = () => {
    setIsStaffExtended(!isStaffExtended);
    setIsVIPExtended(false);
    setIsAutoPassExtended(false);
    setIsFastTrackExtended(false);
    setIsQMExtended(false);
    setIsSweepExtended(false);
  };

  const toggleVIPExtension = () => {
    setIsVIPExtended(!isVIPExtended);
    setIsStaffExtended(false);
    setIsAutoPassExtended(false);
    setIsFastTrackExtended(false);
    setIsQMExtended(false);
    setIsSweepExtended(false);
  };

  const toggleAutoPassExtension = () => {
    setIsAutoPassExtended(!isAutoPassExtended);
    setIsStaffExtended(false);
    setIsVIPExtended(false);
    setIsFastTrackExtended(false);
    setIsQMExtended(false);
    setIsSweepExtended(false);
  };

  const toggleFastTrackExtension = () => {
    setIsFastTrackExtended(!isFastTrackExtended);
    setIsStaffExtended(false);
    setIsVIPExtended(false);
    setIsAutoPassExtended(false);
    setIsQMExtended(false);
    setIsSweepExtended(false);
  };

  const toggleQMExtension = () => {
    setIsQMExtended(!isQMExtended);
    setIsStaffExtended(false);
    setIsVIPExtended(false);
    setIsAutoPassExtended(false);
    setIsFastTrackExtended(false);
    setIsSweepExtended(false);
  };

  const toggleSweepExtension = () => {
    setIsSweepExtended(!isSweepExtended);
    setIsStaffExtended(false);
    setIsVIPExtended(false);
    setIsAutoPassExtended(false);
    setIsQMExtended(false);
    setIsFastTrackExtended(false);
  };

  const [{ isOverStaff }, dropStaff] = useDrop({
    accept: ItemTypes.PRODUCT,
    drop: (item) => {
      if (!staffSedProducts.some((p) => p.id === item.product.id)) {
        addToStaff(item.product);
      }
      return { targetSection: 'Staff' };
    },
    collect: (monitor) => ({
      isOverStaff: monitor.isOver(),
    }),
  });

  const [{ isOverVIP }, dropVIP] = useDrop({
    accept: ItemTypes.PRODUCT,
    drop: (item) => {
      if (!vipProducts.some((p) => p.id === item.product.id)) {
        addToVIP(item.product);
      }
      return { targetSection: 'VIP' };
    },
    collect: (monitor) => ({
      isOverVIP: monitor.isOver(),
    }),
  });

  const [{ isOverAutoPass }, dropAutoPass] = useDrop({
    accept: ItemTypes.PRODUCT,
    drop: (item) => {
      if (!autoPassProducts.some((p) => p.id === item.product.id)) {
        addToAutoPass(item.product);
      }
      return { targetSection: 'Auto Pass' };
    },
    collect: (monitor) => ({
      isOverAutoPass: monitor.isOver(),
    }),
  });
  const [{ isOverFastTrack }, dropFastTrack] = useDrop({
    accept: ItemTypes.PRODUCT,
    drop: (item) => {
      if (!FastTrackProducts.some((p) => p.id === item.product.id)) {
        addToFastTrack(item.product);
      }
      return { targetSection: 'Fast Track and Host' };
    },
    collect: (monitor) => ({
      isOverFastTrack: monitor.isOver(),
    }),
  });
  const [{ isOverSweep }, dropSweep] = useDrop({
    accept: ItemTypes.PRODUCT,
    drop: (item) => {
      if (!SweepProducts.some((p) => p.id === item.product.id)) {
        addToSweep(item.product);
      }
      return { targetSection: 'Sweep' };
    },
    collect: (monitor) => ({
      isOverSweep: monitor.isOver(),
    }),
  });
  const [{ isOverQM }, dropQM] = useDrop({
    accept: ItemTypes.PRODUCT,
    drop: (item) => {
      if (!QMProducts.some((p) => p.id === item.product.id)) {
        addToQM(item.product);
      }
      return { targetSection: 'QM' };
    },
    collect: (monitor) => ({
      isOverQM: monitor.isOver(),
    }),
  });
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
  const DraggableStaffItem = ({ product }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.PRODUCT,
      item: { product, origin: 'PopoutMenu' },
      end: (item, monitor) => {
        const didDrop = monitor.didDrop();
        const dropResult = monitor.getDropResult();
        if (didDrop && (!dropResult || dropResult.targetSection !== 'Staff')) {
          removeFromStaff(item.product);
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div
        ref={drag}
        className="staff-item"
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <div className="staff-date">{formatDate(product.Shift_Start_Date)}</div>
        <div className="staff-info">
          <h4>
            {product.name} {product.IDname}
          </h4>
          <p>
            {product.Shift_Start_Time} - {product.Shift_End_Time}
          </p>
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


  const DraggableVIPItem = ({ product }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.PRODUCT,
      item: { product, origin: 'PopoutMenu' },
      end: (item, monitor) => {
        const didDrop = monitor.didDrop();
        const dropResult = monitor.getDropResult();
        if (didDrop && (!dropResult || dropResult.targetSection !== 'VIP')) {
          removeFromVIP(item.product);
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div
        ref={drag}
        className="vip-item"
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <div className="vip-date">{formatDate(product.Shift_Start_Date)}</div>
        <div className="vip-info">
          <h4>
            {product.name} {product.IDname}
          </h4>
          <p>
            {product.Shift_Start_Time} - {product.Shift_End_Time}
          </p>
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

  const DraggableAutoPassItem = ({ product }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.PRODUCT,
      item: { product, origin: 'PopoutMenu' },
      end: (item, monitor) => {
        const didDrop = monitor.didDrop();
        const dropResult = monitor.getDropResult();
        if (didDrop && (!dropResult || dropResult.targetSection !== 'Auto Pass')) {
          removeFromAutoPass(item.product);
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div
        ref={drag}
        className="autopass-item"
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <div className="autopass-date">{formatDate(product.Shift_Start_Date)}</div>
        <div className="autopass-info">
          <h4>
            {product.name} {product.IDname}
          </h4>
          <p>
            {product.Shift_Start_Time} - {product.Shift_End_Time}
          </p>
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

  const DraggableFastTrackItem = ({ product }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.PRODUCT,
      item: { product, origin: 'PopoutMenu' },
      end: (item, monitor) => {
        const didDrop = monitor.didDrop();
        const dropResult = monitor.getDropResult();
        if (didDrop && (!dropResult || dropResult.targetSection !== 'Fast Track and Host')) {
          removeFromFastTrack(item.product);
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div
        ref={drag}
        className="autopass-item"
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <div className="autopass-date">{formatDate(product.Shift_Start_Date)}</div>
        <div className="autopass-info">
          <h4>
            {product.name} {product.IDname}
          </h4>
          <p>
            {product.Shift_Start_Time} - {product.Shift_End_Time}
          </p>
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
  const DraggableSweepItem = ({ product }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.PRODUCT,
      item: { product, origin: 'PopoutMenu' },
      end: (item, monitor) => {
        const didDrop = monitor.didDrop();
        const dropResult = monitor.getDropResult();
        if (didDrop && (!dropResult || dropResult.targetSection !== 'Sweep')) {
          removeFromSweep(item.product);
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div
        ref={drag}
        className="autopass-item"
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <div className="autopass-date">{formatDate(product.Shift_Start_Date)}</div>
        <div className="autopass-info">
          <h4>
            {product.name} {product.IDname}
          </h4>
          <p>
            {product.Shift_Start_Time} - {product.Shift_End_Time}
          </p>
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

  const DraggableQMItem = ({ product }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.PRODUCT,
      item: { product, origin: 'PopoutMenu' },
      end: (item, monitor) => {
        const didDrop = monitor.didDrop();
        const dropResult = monitor.getDropResult();
        if (didDrop && (!dropResult || dropResult.targetSection !== 'QM')) {
          removeFromQM(item.product);
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div
        ref={drag}
        className="autopass-item"
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <div className="autopass-date">{formatDate(product.Shift_Start_Date)}</div>
        <div className="autopass-info">
          <h4>
            {product.name} {product.IDname}
          </h4>
          <p>
            {product.Shift_Start_Time} - {product.Shift_End_Time}
          </p>
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

  return (
    <>
      <div
        className={`popout-menu ${isOpen ? 'open' : ''} ${isStaffExtended || isVIPExtended || isAutoPassExtended || isFastTrackExtended || isSweepExtended || isQMExtended ? 'extended' : ''
          }`}

      >
        <div className="popout-tab" onClick={toggleMenu}>
          <div className="tab-arrow">{isOpen ? '→' : '←'}</div>
        </div>
        <div className="menu-content">
          <h2>Actions and Positions</h2>
          <ul>
            <li onClick={toggleRollcallPopup}>
              Rollca
              {rollcallNotificationCount > 0 && (
                <span style={{
                  background: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  marginLeft: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}>
                  {rollcallNotificationCount}
                </span>
              )}
            </li>
            <li onClick={toggleStaffExtension}>Staff(SED)</li>
            <li onClick={toggleVIPExtension}>VIP</li>
            <li onClick={toggleAutoPassExtension}>Auto Pass</li>
            <li onClick={toggleFastTrackExtension}>Fast Track and Host</li>
            <li onClick={toggleQMExtension}>QM</li>
            <li onClick={toggleSweepExtension}>Sweep</li>
          </ul>
        </div>
        {/* Pie Chart showing On Duty vs On Break */}
        <div
          className="pie-chart-container"
          style={{
            width: '250px',
            height: '250px',
            marginTop: '20px',
            marginBottom: '20px',
            marginLeft: '20px',
            flexShrink: 0,
          }}
        >

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'On Duty', value: onDutyProducts.length },
                  { name: 'On Break', value: onBreakProducts.length },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
              >
                <Cell key="onDuty" fill="#4CAF50" />
                <Cell key="onBreak" fill="#FFC107" />
                <Label
                  value={`Total: ${totalStaff}`}
                  position="center"
                  fill="#4CAF50"
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {isStaffExtended && (
          <div className="staff-section" ref={dropStaff}>
            <h3>Staff Information</h3>
            <div className={`staff-list ${isOverStaff ? 'staff-section-hover' : ''}`}>
              {staffSedProducts.length > 0 ? (
                staffSedProducts.map((product) => <DraggableStaffItem key={product.id} product={product} />)
              ) : (
                <p>No staff members are assigned to Staff.</p>
              )}
            </div>
          </div>
        )}

        {isVIPExtended && (
          <div className="staff-section" ref={dropVIP}>
            <h3>VIP Information</h3>
            <div className={`staff-list ${isOverVIP ? 'staff-section-hover' : ''}`}>
              {vipProducts.length > 0 ? (
                vipProducts.map((product) => <DraggableVIPItem key={product.id} product={product} />)
              ) : (
                <p>No VIPs assigned.</p>
              )}
            </div>
          </div>
        )}

        {isAutoPassExtended && (
          <div className="staff-section" ref={dropAutoPass}>
            <h3>Auto Pass Information</h3>
            <div className={`staff-list ${isOverAutoPass ? 'staff-section-hover' : ''}`}>
              {autoPassProducts.length > 0 ? (
                autoPassProducts.map((product) => <DraggableAutoPassItem key={product.id} product={product} />)
              ) : (
                <p>No Auto Pass items assigned.</p>
              )}
            </div>
          </div>
        )}

        {isFastTrackExtended && (
          <div className="staff-section" ref={dropFastTrack}>
            <h3>Fast Track Information</h3>
            <div className={`staff-list ${isOverFastTrack ? 'staff-section-hover' : ''}`}>
              {FastTrackProducts.length > 0 ? (
                FastTrackProducts.map((product) => <DraggableFastTrackItem key={product.id} product={product} />)
              ) : (
                <p>No staff members are assigned to Fast Track.</p>
              )}
            </div>
          </div>
        )}

        {isSweepExtended && (
          <div className="staff-section" ref={dropSweep}>
            <h3>Sweep Information</h3>
            <div className={`staff-list ${isOverSweep ? 'staff-section-hover' : ''}`}>
              {SweepProducts.length > 0 ? (
                SweepProducts.map((product) => <DraggableSweepItem key={product.id} product={product} />)
              ) : (
                <p>No staff members are assigned to a Sweep</p>
              )}
            </div>
          </div>
        )}

        {isQMExtended && (
          <div className="staff-section" ref={dropQM}>
            <h3>QM Information</h3>
            <div className={`staff-list ${isOverQM ? 'staff-section-hover' : ''}`}>
              {QMProducts.length > 0 ? (
                QMProducts.map((product) => <DraggableQMItem key={product.id} product={product} />)
              ) : (
                <p>No staff members are assigned to QM.</p>
              )}
            </div>
          </div>
        )}

      </div>

      {isRollcallOpen && (
        <div className="popup-overlay">
          <div className="popup-content rollcall-popup">
            <h2>Rollcall</h2>
            <div className="rollcall-section">
              <h3>Available for Rollcall</h3>
              {rollcallProducts.length > 0 ? (
                rollcallProducts
                  .filter((product) => {
                    const nowMinutes = testTime
                      ? testTime.hours * 60 + testTime.minutes
                      : new Date().getHours() * 60 + new Date().getMinutes();

                    const [startHour, startMinute] = product.Shift_Start_Time.split(':').map(Number);
                    const shiftMinutes = startHour * 60 + startMinute;

                    return nowMinutes >= shiftMinutes && nowMinutes < shiftMinutes + 10;
                  })
                  .map((product, index) => (
                    <div
                      key={product.id}
                      className="product-item rollcall-item"
                      onClick={() => moveToOnDuty(product.id)}
                    >
                      <h4>
                        {product.name} {product.IDname}
                      </h4>
                      <p>
                        {product.Shift_Start_Time} - {product.Shift_End_Time}
                      </p>
                    </div>
                  ))
              ) : (
                <p>No one is available for Rollcall.</p>
              )}
            </div>
            <button className="close-button" onClick={toggleRollcallPopup}>
              Close
            </button>
          </div>
        </div>
      )}
      {showNewRollcallPopup && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#fff',
          color: '#333',
          border: '1px solid #ccc',
          padding: '16px 24px',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 9999,
        }}>
          <strong>🚨 New Rollcall</strong>
          <div>{rollcallNotificationCount} staff ready to check in</div>
        </div>
      )}
    </>

  );
};

export default PopoutMenu;

