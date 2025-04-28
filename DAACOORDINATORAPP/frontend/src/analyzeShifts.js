import passengerData from './passengerData';

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const hours = Math.floor(mins / 60) % 24;
  const minutes = mins % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function findGreenSlot(startMin) {
  for (let i = startMin; i < 1440; i++) {
    const hour = Math.floor(i / 60);
    const slot = `${String(hour).padStart(2, '0')}:00-${String((hour + 1) % 24).padStart(2, '0')}:00`;
    if (passengerData[slot] === 'Green') {
      return i;
    }
  }
  return null;
}

export function analyzeShifts(onDutyProducts) {
    console.log('onDutyProducts received:', onDutyProducts); // 🔍 Debug
  let output = [];

  for (let i = 0; i < onDutyProducts.length; i++) {
    const person = onDutyProducts[i];
    const startMin = timeToMinutes(person.Shift_Start_Time);
    const endMin = timeToMinutes(person.Shift_End_Time);
    const shiftLength = endMin - startMin;

    const lines = [];
    lines.push(`${person.name} ${person.IDname}`);
    lines.push(`Start: ${person.Shift_Start_Time}, End: ${person.Shift_End_Time}`);

    const breaks = [];

    if (shiftLength >= 390) {
      const firstEligible = startMin + 120;
      const firstDeadline = startMin + 270;
      const firstBreakStart = findGreenSlot(firstEligible);

      if (firstBreakStart && firstBreakStart <= firstDeadline) {
        breaks.push({ start: firstBreakStart, length: 40 });
      }

      if (breaks.length > 0) {
        const secondEligible = breaks[0].start + 180;
        if (secondEligible + 30 <= endMin) {
          const secondBreakStart = findGreenSlot(secondEligible);
          if (secondBreakStart) {
            breaks.push({ start: secondBreakStart, length: 30 });
          }
        }
      }
    } else if (shiftLength >= 180) {
      const breakStart = findGreenSlot(startMin + 120);
      if (breakStart && breakStart + 30 <= endMin) {
        breaks.push({ start: breakStart, length: 30 });
      }
    }

    for (let index = 0; index < breaks.length; index++) {
      const b = breaks[index];
      const replacement = onDutyProducts[(i + index + 1) % onDutyProducts.length];
      lines.push(
        `Break ${index + 1}: ${minutesToTime(b.start)} - ${minutesToTime(b.start + b.length)}, Replaced by: ${replacement.name}`
      );
    }

    lines.push(`Finished at: ${person.Shift_End_Time}`);
    output.push(lines.join('\n'));
  }

  return output.join('\n\n');
}
