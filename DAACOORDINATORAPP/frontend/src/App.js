import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ProductList from './Product';
import PopoutMenu from './PopoutMenu';
import axios from 'axios';
import AIHelper from './AIHelper';

function App() {
  const [onDutyProducts, setOnDutyProducts] = useState([]);
  const [rollcallProducts, setRollcallProducts] = useState([]);
  const [staffSedProducts, setStaffSedProducts] = useState([]);
  const [vipProducts, setVipProducts] = useState([]);
  const [autoPassProducts, setAutoPassProducts] = useState([]);
  const [FastTrackProducts, setFastTrackProducts] = useState([]);
  const [QMProducts, setQMProducts] = useState([]);
  const [SweepProducts, setSweepProducts] = useState([]);
  const [testTime, setTestTime] = useState([]);
  const [onBreakProducts, setOnBreakProducts] = useState([]);
  const [finishedProducts, setFinishedProducts] = useState([]);
  const autoIncrementRef = useRef(null);

  const moveFinishedToOnDuty = useCallback((productId) => {
    const productToMove = finishedProducts.find((p) => p.id === productId);
    if (!productToMove) return;

    setFinishedProducts((prevFinished) => prevFinished.filter((p) => p.id !== productId));
    setOnDutyProducts((prevOnDuty) =>
      [...prevOnDuty, productToMove].sort((a, b) => a.name.localeCompare(b.name))
    );

    console.log('Moved from Finished back to On Duty:', productToMove);
  }, [finishedProducts]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/product/`)
      .then((response) => {
        const sortedProducts = response.data.sort((a, b) => a.name.localeCompare(b.name));
        setRollcallProducts(sortedProducts);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const incrementTestTime = () => {
    setTestTime((prev) => {
      if (!prev) return null;
      let newMinutes = prev.minutes + 1;
      let newHours = prev.hours;
      if (newMinutes >= 60) {
        newMinutes = 0;
        newHours = (newHours + 1) % 24;
      }
      return { hours: newHours, minutes: newMinutes };
    });
  };

  const safeOnDutyProducts = onDutyProducts.map((p) => ({
    ...p,
    finishedCount: p.finishedCount || 0,
  }));

  const startAutoIncrement = (speed = 1000) => {
    if (autoIncrementRef.current) clearInterval(autoIncrementRef.current);

    autoIncrementRef.current = setInterval(() => {
      incrementTestTime();
    }, speed);
  };

  const stopAutoIncrement = () => {
    clearInterval(autoIncrementRef.current);
    autoIncrementRef.current = null;
  };

  const moveToOnDuty = (productId) => {
    const productToMove = rollcallProducts.find((p) => p.id === productId);
    if (!productToMove) return;

    setRollcallProducts((prevProducts) => prevProducts.filter((p) => p.id !== productId));
    setOnDutyProducts((prevOnDuty) =>
      [...prevOnDuty, productToMove].sort((a, b) => a.name.localeCompare(b.name))
    );

    console.log('Moved to On Duty:', productToMove);
  };

  const addToStaff = (product) => {
    if (!staffSedProducts.some((p) => p.id === product.id)) {
      setStaffSedProducts((prevStaff) => [...prevStaff, product].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const removeFromStaff = (product) => {
    setStaffSedProducts((prevStaff) => prevStaff.filter((p) => p.id !== product.id));
  };

  const addToVIP = (product) => {
    if (!vipProducts.some((p) => p.id === product.id)) {
      setVipProducts((prevVIP) => [...prevVIP, product].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const removeFromVIP = (product) => {
    setVipProducts((prevVIP) => prevVIP.filter((p) => p.id !== product.id));
  };

  const addToAutoPass = (product) => {
    if (!autoPassProducts.some((p) => p.id === product.id)) {
      setAutoPassProducts((prevAutoPass) => [...prevAutoPass, product].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const removeFromAutoPass = (product) => {
    setAutoPassProducts((prevAutoPass) => prevAutoPass.filter((p) => p.id !== product.id));
  };

  const addToFastTrack = (product) => {
    if (!FastTrackProducts.some((p) => p.id === product.id)) {
      setFastTrackProducts((prevFastTrack) => [...prevFastTrack, product].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const addToQM = (product) => {
    if (!QMProducts.some((p) => p.id === product.id)) {
      setQMProducts((prevQM) => [...prevQM, product].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const addToSweep = (product) => {
    if (!SweepProducts.some((p) => p.id === product.id)) {
      setSweepProducts((prevSweep) => [...prevSweep, product].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const removeFromFastTrack = (product) => {
    setFastTrackProducts((prevFastTrack) => prevFastTrack.filter((p) => p.id !== product.id));
  };

  const removeFromQM = (product) => {
    setQMProducts((prevQM) => prevQM.filter((p) => p.id !== product.id));
  };

  const removeFromSweep = (product) => {
    setSweepProducts((prevSweep) => prevSweep.filter((p) => p.id !== product.id));
  };

  useEffect(() => {
    if (finishedProducts.length > 0) {
      const timer = setTimeout(() => {
        const lastFinished = finishedProducts[finishedProducts.length - 1];
        if (lastFinished) {
          moveFinishedToOnDuty(lastFinished.id);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [finishedProducts, moveFinishedToOnDuty]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        {/* Top Panel */}
        <div style={{ padding: '10px', background: '#f5f5f5', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <strong>Test Clock:</strong>
          <select
            onChange={(e) => {
              const [h, m] = e.target.value.split(':').map(Number);
              setTestTime(e.target.value ? { hours: h, minutes: m } : null);
            }}
          >
            <option value="">System Time</option>
            {Array.from({ length: 24 }).map((_, h) =>
              Array.from({ length: 60 }).map((_, m) => {
                const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                return (
                  <option key={label} value={label}>
                    {label}
                  </option>
                );
              })
            )}
          </select>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={() => startAutoIncrement(1000)}>▶️ 1x Speed</button>
            <button onClick={() => startAutoIncrement(500)}>⚡ 2x Speed</button>
            <button onClick={stopAutoIncrement}>🛑 Stop</button>
          </div>

          {testTime && (
            <>
              <span>Using: {String(testTime.hours).padStart(2, '0')}:{String(testTime.minutes).padStart(2, '0')}</span>
              <button onClick={() => setTestTime(null)} style={{ marginLeft: '10px' }}>
                Reset to System Time
              </button>
            </>
          )}
        </div>

        {/* Components */}
        <AIHelper
          onDutyProducts={safeOnDutyProducts}
          onBreakProducts={onBreakProducts}
          finishedProducts={finishedProducts}
          autoPassProducts={autoPassProducts}
          FastTrackProducts={FastTrackProducts}
          QMProducts={QMProducts}
          SweepProducts={SweepProducts}
          testTime={testTime}
        />

        <ProductList
          rollcallProducts={rollcallProducts}
          onDutyProducts={onDutyProducts}
          setOnDutyProducts={setOnDutyProducts}
          onBreakProducts={onBreakProducts}
          setOnBreakProducts={setOnBreakProducts}
          finishedProducts={finishedProducts}
          setFinishedProducts={setFinishedProducts}
          staffProducts={staffSedProducts}
          setStaffProducts={setStaffSedProducts}
          vipProducts={vipProducts}
          autoPassProducts={autoPassProducts}
          FastTrackProducts={FastTrackProducts}
          QMProducts={QMProducts}
          SweepProducts={SweepProducts}
          testTime={testTime}
        />

        <PopoutMenu
          rollcallProducts={rollcallProducts}
          moveToOnDuty={moveToOnDuty}
          staffSedProducts={staffSedProducts}
          addToStaff={addToStaff}
          removeFromStaff={removeFromStaff}
          vipProducts={vipProducts}
          addToVIP={addToVIP}
          removeFromVIP={removeFromVIP}
          autoPassProducts={autoPassProducts}
          addToAutoPass={addToAutoPass}
          removeFromAutoPass={removeFromAutoPass}
          FastTrackProducts={FastTrackProducts}
          addToFastTrack={addToFastTrack}
          SweepProducts={SweepProducts}
          addToSweep={addToSweep}
          QMProducts={QMProducts}
          addToQM={addToQM}
          removeFromFastTrack={removeFromFastTrack}
          removeFromSweep={removeFromSweep}
          removeFromQM={removeFromQM}
          testTime={testTime}
          finishedProducts={finishedProducts}
          onDutyProducts={onDutyProducts}
          onBreakProducts={onBreakProducts}
        />
      </div>
    </DndProvider>
  );
}

export default App;
