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
  const [isAutomated, setIsAutomated] = useState(false);
  const breakSchedule = useRef({}); // { IDName: "HH:MM" }
  const lastGPTHourRunRef = useRef(null);
  const onDutyRef = useRef(onDutyProducts);
  const onBreakRef = useRef(onBreakProducts);
  const testTimeRef = useRef(testTime);
  const [assignedBreaks, setAssignedBreaks] = useState({});
  const moveFinishedToOnDuty = useCallback((productId) => {
    const productToMove = finishedProducts.find((p) => p.id === productId);
    if (!productToMove) return;

    setFinishedProducts((prevFinished) => prevFinished.filter((p) => p.id !== productId));
    setOnDutyProducts((prevOnDuty) =>
      [...prevOnDuty, productToMove].sort((a, b) => a.name.localeCompare(b.name))
    );

    console.log('Moved from Finished back to On Duty:', productToMove);
  }, [finishedProducts]);
  const getActiveRollcallProducts = () => {
    if (!testTime) return [];

    const nowMinutes = testTime.hours * 60 + testTime.minutes;

    return rollcallProducts.filter((product) => {
      const [startHour, startMinute] = product.Shift_Start_Time.split(':').map(Number);
      const shiftStartMinutes = startHour * 60 + startMinute;

      const isInRollcallWindow = nowMinutes >= shiftStartMinutes && nowMinutes < shiftStartMinutes + 10;
      const alreadyOnDuty = onDutyProducts.some((p) => p.id === product.id);

      return isInRollcallWindow && !alreadyOnDuty;
    });
  };
  useEffect(() => {
    onDutyRef.current = onDutyProducts;
  }, [onDutyProducts]);

  useEffect(() => {
    onBreakRef.current = onBreakProducts;
  }, [onBreakProducts]);

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
  useEffect(() => {
    testTimeRef.current = testTime;
  }, [testTime]);

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

    const newProduct = {
      ...productToMove,
      finishedCount: productToMove.finishedCount || 0, // ← ensure it's 0 if undefined
    };

    setRollcallProducts((prevProducts) => prevProducts.filter((p) => p.id !== productId));
    setOnDutyProducts((prevOnDuty) =>
      [...prevOnDuty, newProduct].sort((a, b) => a.name.localeCompare(b.name))
    );

    console.log('Moved to On Duty:', newProduct);
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
  const automationTick = useRef();

  useEffect(() => {
    automationTick.current = () => {
      if (!isAutomated || !testTimeRef.current) return;

      const currentHour = testTimeRef.current.hours;
      const currentMinute = testTimeRef.current.minutes;
      const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;


      // 1. Import from Rollcall to OnDuty
      const activeRollcall = getActiveRollcallProducts();
      if (activeRollcall.length > 0) {
        setOnDutyProducts(prev => [
          ...prev,
          ...activeRollcall.filter(p => !prev.some(existing => existing.id === p.id))
        ]);
      }

      // 2. GPT analysis every hour
      // 2. GPT analysis every 2 hours starting from 04:00
      const isEvenHour = currentHour % 2 === 0;
      const isAfterStart = currentHour >= 4;

      if (
        currentMinute === 0 &&
        isEvenHour &&
        isAfterStart &&
        lastGPTHourRunRef.current !== currentHour
      ) {
        console.log(logHeader);
        const unassignedStaff = onDutyRef.current.filter(person => {
          const breaks = assignedBreaks[person.IDname];
          return !breaks || (person.finishedCount === 0 && !breaks.second);
        });

        axios.post(`${process.env.REACT_APP_API_URL}/api/analyze/`, {
          onDuty: unassignedStaff,
          onBreak: onBreakRef.current,
          passengerData: require('./passengerData').default,
          currentHour,
        })

          .then((response) => {
            Object.entries(response.data).forEach(([id, time]) => {
              if (!breakSchedule.current[id]) {
                breakSchedule.current[id] = time;
              }
            });

            lastGPTHourRunRef.current = currentHour;

            setAssignedBreaks(prev => ({ ...prev, ...response.data }));

            console.log(logText);
          })


          .catch((err) => {
            const errorLog = `GPT automation error: ${err.message}`;
            console.error(errorLog);
          });
      }



      // 3. Move to Break if time matches
      setOnDutyProducts(prev => {
        const toBreak = [];
        const remaining = [];
        const newBreakLogs = [];

        prev.forEach(person => {
          const finishedCount = person.finishedCount || 0;

          // Skip if already had two breaks
          if (finishedCount >= 2) {
            remaining.push(person);
            return;
          }

          const breaks = breakSchedule.current[person.IDname];
          if (!breaks) {
            remaining.push(person);
            return;
          }

          const nextBreakType = finishedCount === 0 ? "first" : "second";
          const scheduledTime = breaks[nextBreakType];

          if (scheduledTime) {
            const [scheduledHour, scheduledMinute] = scheduledTime.split(':').map(Number);
            const currentTotal = currentHour * 60 + currentMinute;
            const scheduledTotal = scheduledHour * 60 + scheduledMinute;

            if (scheduledTotal <= currentTotal) {
              const shiftEnd = new Date(`1970-01-01T${person.Shift_End_Time}Z`);
              const shiftStart = new Date(`1970-01-01T${person.Shift_Start_Time}Z`);
              if (shiftEnd < shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);
              const shiftMinutes = (shiftEnd - shiftStart) / (1000 * 60);

              // Finish instead of breaking if they've already had 2 breaks or the shift is short
              const isShortShift = shiftMinutes < 390;
              const shouldFinish = person.finishedCount === 2 || (person.finishedCount === 1 && isShortShift);

              if (scheduledTotal <= currentTotal) {
                const shiftStart = new Date(`1970-01-01T${person.Shift_Start_Time}Z`);
                let shiftEnd = new Date(`1970-01-01T${person.Shift_End_Time}Z`);
                if (shiftEnd < shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);
                const shiftMinutes = (shiftEnd - shiftStart) / (1000 * 60);

                const isShortShift = shiftMinutes < 390;
                const shouldFinish = person.finishedCount === 2 || (person.finishedCount === 1 && isShortShift);

                if (shouldFinish) {
                  // Immediately finish them without putting into On Break
                  const finishedPerson = {
                    ...person,
                    finishedCount: (person.finishedCount || 0) + 1,
                  };

                  setFinishedProducts(prev =>
                    [...prev, finishedPerson].sort((a, b) => a.name.localeCompare(b.name))
                  );

                  newBreakLogs.push(`✅ ${person.name} (ID: ${person.IDname}) sent home automatically at ${currentTimeStr}`);
                } else {
                  const duration = determineBreakDuration(person);
                  const breakEndTime = calculateBreakEndTime(person, testTime, duration);

                  const updatedPerson = {
                    ...person,
                    breakEndTime,
                    breakStartTestTime: { ...testTime },
                    breakDuration: duration * 60,
                  };

                  toBreak.push(updatedPerson);
                  newBreakLogs.push(`🟡 ${person.name} (ID: ${person.IDname}) started ${duration}-min ${nextBreakType} break at ${currentTimeStr}`);
                }

                return; // Don't push them to remaining
              }
            }
          }

          // If not ready for break yet, keep them on duty
          remaining.push(person);
        });

        if (toBreak.length > 0) {
          setOnBreakProducts(prev =>
            [...prev, ...toBreak].sort((a, b) => a.name.localeCompare(b.name))
          );
        }

        return remaining;
      });

      // 3.5 Remove anyone whose shift just ended
      setOnDutyProducts((prev) => {
        const remaining = [];
        const nowTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
        const justRemoved = [];

        prev.forEach((person) => {
          const [endHour, endMinute] = person.Shift_End_Time.split(':').map(Number);
          if (endHour === currentHour && endMinute === currentMinute) {
            // Remove them completely (no On Break, no Finished)
            justRemoved.push(person.name);
          } else {
            remaining.push(person);
          }
        });

        return remaining;
      });

      // 4. Move to Finished when break ends
      setOnBreakProducts((prevOnBreak) => {
        const stillOnBreak = [];
        const nowFinished = [];

        prevOnBreak.forEach((person) => {
          const { breakStartTestTime, breakDuration } = person;

          if (!breakStartTestTime || breakDuration == null) {
            stillOnBreak.push(person);
            return;
          }

          const startTotal = breakStartTestTime.hours * 60 + breakStartTestTime.minutes;
          const nowTotal = testTime.hours * 60 + testTime.minutes;

          const minutesElapsed = nowTotal - startTotal;

          if (minutesElapsed >= breakDuration / 60) {
            nowFinished.push(person);
          } else {
            stillOnBreak.push(person);
          }
        });

        if (nowFinished.length > 0) {
          setFinishedProducts((prevFinished) => [...prevFinished, ...nowFinished]);
        }

        return stillOnBreak;
      });

    };
  }, [onDutyProducts, onBreakProducts, testTime, isAutomated, rollcallProducts]);

  // Run interval every second using latest automationTick ref
  useEffect(() => {
    if (!isAutomated) return;
    const interval = setInterval(() => {
      if (automationTick.current) automationTick.current();
    }, 1000);
    return () => clearInterval(interval);
  }, [isAutomated]);


  const calculateBreakEndTime = (person, time, duration) => {
    let endMinutes = time.minutes + duration;
    let endHours = time.hours;

    if (endMinutes >= 60) {
      endHours += Math.floor(endMinutes / 60);
      endMinutes %= 60;
    }

    return { hours: endHours % 24, minutes: endMinutes };
  };
  const determineBreakDuration = (person) => {
    const shiftStart = new Date(`1970-01-01T${person.Shift_Start_Time}Z`);
    let shiftEnd = new Date(`1970-01-01T${person.Shift_End_Time}Z`);

    // Handle overnight shift
    if (shiftEnd < shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);

    const shiftMinutes = (shiftEnd - shiftStart) / (1000 * 60);

    if (person.finishedCount === 0 && shiftMinutes > 490) return 40;
    return 30;
  };


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
            <button
              style={{ backgroundColor: isAutomated ? '#d44' : '#4caf50', color: 'white' }}
              onClick={() => setIsAutomated(prev => !prev)}
            >
              {isAutomated ? '🛑 Stop Automation' : '🤖 Automate'}
            </button>

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

        {/* Main FLEX section */}
        <div className="main-container">
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
            isAutomated={isAutomated}
          />

          <AIHelper
            onDutyProducts={safeOnDutyProducts}
            onBreakProducts={onBreakProducts}
            finishedProducts={finishedProducts}
            autoPassProducts={autoPassProducts}
            FastTrackProducts={FastTrackProducts}
            QMProducts={QMProducts}
            SweepProducts={SweepProducts}
            testTime={testTime}
            isAutomated={isAutomated}
            setIsAutomated={setIsAutomated}
          />

        </div>

        {/* PopoutMenu (floating) */}
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
