import React, { useState, useEffect } from 'react';
import './AIHelper.css';
import passengerData from './passengerData';
import { FaRobot } from 'react-icons/fa';
import AIAssistant from './AIAssistant';

const AIHelper = ({
  onDutyProducts,
  onBreakProducts,
  finishedProducts,
  autoPassProducts,
  FastTrackProducts,
  QMProducts,
  SweepProducts,
  testTime,
  isAutomated,
  setIsAutomated,
  startAutoIncrement,
  stopAutoIncrement
}) => {
  const [alerts, setAlerts] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState({});

  const addAlert = (type, message, productId) => {
    setAlerts((prev) => {
      if (prev.some((alert) => alert.type === type && alert.productId === productId)) return prev;
      return [...prev, { type, message, productId }];
    });
  };

  const removeAlert = (productId, type) => {
    setAlerts((prev) => prev.filter((alert) => !(alert.productId === productId && alert.type === type)));
  };

  const dismissAlert = (productId, type) => {
    setAlerts((prev) => prev.filter((alert) => !(alert.productId === productId && alert.type === type)));
    if (testTime) {
      setDismissedAlerts((prev) => ({
        ...prev,
        [type]: `${testTime.hours}:${testTime.minutes < 30 ? '00' : '30'}`,
      }));
    }
  };

  useEffect(() => {
    if (!testTime || onDutyProducts.length === 0) return;

    // Helpers
    const getElapsedMinutes = (startTime) => {
      if (!testTime || !startTime) return 0;
      const start = new Date(`1970-01-01T${startTime}Z`);
      const now = new Date(`1970-01-01T${String(testTime.hours).padStart(2, '0')}:${String(testTime.minutes).padStart(2, '0')}:00Z`);
      return Math.floor((now - start) / 60000);
    };

    const shouldShowAlert = (type) => {
      if (!testTime) return true;
      const currentBlock = `${testTime.hours}:${testTime.minutes < 30 ? '00' : '30'}`;
      return dismissedAlerts[type] !== currentBlock;
    };

    // Break Reminder Alerts
    onDutyProducts.forEach((staff) => {
      const workedMinutes = getElapsedMinutes(staff.Shift_Start_Time);
      const finishedCount = staff.finishedCount ?? 0;

      if (workedMinutes >= 255 && finishedCount < 1) {
        addAlert('breakReminder', `🕒 ${staff.name} ${staff.IDname} is about to exceed 4.5 hours without a break!`, staff.id);
      } else {
        removeAlert(staff.id, 'breakReminder');
      }
    });

    // Role Coverage Alerts
    if (autoPassProducts.length < 4 && shouldShowAlert('autopass')) {
      addAlert('autopass', `⚠️ Only ${autoPassProducts.length} on AutoPass (needs 4)`, 'autopass');
    } else {
      removeAlert('autopass', 'autopass');
    }

    if (FastTrackProducts.length < 2 && shouldShowAlert('fasttrack')) {
      addAlert('fasttrack', `⚠️ Only ${FastTrackProducts.length} on FastTrack/Host (needs 2)`, 'fasttrack');
    } else {
      removeAlert('fasttrack', 'fasttrack');
    }

    if (QMProducts.length < 1 && shouldShowAlert('qm')) {
      addAlert('qm', `⚠️ No one assigned to QM (needs 1)`, 'qm');
    } else {
      removeAlert('qm', 'qm');
    }

    if (SweepProducts.length < 1 && shouldShowAlert('sweep')) {
      addAlert('sweep', `⚠️ No one assigned to Sweep (needs 1–3)`, 'sweep');
    } else {
      removeAlert('sweep', 'sweep');
    }

    // Busy Period setup
    const nowStr = `${String(testTime.hours).padStart(2, '0')}:${String(testTime.minutes).padStart(2, '0')}`;
    const currentBlock = passengerData.find(p => {
      const [start, end] = p.time.split('-');
      return nowStr >= start && nowStr < end;
    });

    const nextBlockStart = currentBlock?.time?.split('-')[1];
    const nextBlock = passengerData.find(p => p.time.startsWith(nextBlockStart));

    if (nextBlock?.status === 'Red' && shouldShowAlert('busyPeriod')) {
      addAlert('busyPeriod', '🔴 Busy period incoming. Consider staggering breaks.', 'busyPeriod');
    } else {
      removeAlert('busyPeriod', 'busyPeriod');
    }

  }, [testTime, onDutyProducts, autoPassProducts, FastTrackProducts, QMProducts, SweepProducts, dismissedAlerts]);

  const alertCount = alerts.length;

  return (
    <>
      <button className="copilot-button" onClick={() => setPanelOpen(!panelOpen)}>
        <FaRobot size={24} />
        {alertCount > 0 && <div className="copilot-badge">{alertCount}</div>}
      </button>

      {panelOpen && (
        <div className="copilot-panel">
          <div className="copilot-left">
            {alerts.length === 0 ? (
              <div className="copilot-empty">✅ No current issues.</div>
            ) : (
              alerts.map((alert) => (
                <div className="copilot-alert" key={`${alert.type}-${alert.productId}`}>
                  <div>{alert.message}</div>
                  <button onClick={() => dismissAlert(alert.productId, alert.type)}>Dismiss</button>
                </div>
              ))
            )}
          </div>

          <div className="copilot-right">
            <div className="assistant-wrapper">
              <AIAssistant
                onDuty={onDutyProducts}
                onBreak={onBreakProducts}
                finished={finishedProducts}
              />
            </div>
            <div className="automation-container">
              <button
                className={`automation-toggle ${isAutomated ? 'running' : ''}`}
                onClick={() => {
                  setIsAutomated(prev => {
                    const newState = !prev;
                    if (newState) {
                      startAutoIncrement(600);  // 1.5x speed
                    } else {
                      stopAutoIncrement();      // Stop clock
                    }
                    return newState;
                  });
                }}
              >
                <span className="gear-icon">⚙️</span>
                {isAutomated ? 'Stop Automation' : 'Start Automation'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default AIHelper;
