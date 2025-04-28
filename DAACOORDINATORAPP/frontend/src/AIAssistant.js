import React, { useState } from 'react';
import './AIAssistant.css';

const AIAssistant = ({ onDuty = [], onBreak = [], finished = [] }) => {
  const [userInput, setUserInput] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const stripProductData = (product) => ({
    name: product.name || '',
    IDname: product.IDname || '',
    Shift_Start_Time: product.Shift_Start_Time || '',
    Shift_End_Time: product.Shift_End_Time || '',
    finishedCount: product.finishedCount ?? 0,
  });

  const highlightAnswer = (text) => {
    if (!text) return '';

    // Highlight staff names (First Last format)
    const highlighted = text.replace(
      /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g,
      '<span style="color: red; font-weight: bold;">$1</span>'
    );

    // Replace dash bullets with real bullets
    const withBullets = highlighted.replace(/- /g, '• ');

    // Format line breaks properly
    const formatted = withBullets.replace(/\n/g, '<br />');

    return formatted;
  };

  const handleAsk = async () => {
    if (!userInput.trim()) return;
    setAnswer('');
    setLoading(true);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

      const response = await fetch(`${API_URL}/assistant-query/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userInput,
          onDuty: onDuty.map(stripProductData),
          onBreak: onBreak.map(stripProductData),
          finished: finished.map(stripProductData),
        }),
      });

      const data = await response.json();
      if (data.answer) {
        setAnswer(data.answer);
      } else {
        setAnswer('No answer provided.');
      }
    } catch (error) {
      console.error('Error contacting assistant:', error);
      setAnswer('Error contacting assistant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant">
      <h3>🧠 Shift Assistant</h3>

      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Ask a question like: Who is next due a break?"
        className="ai-input"
      />

      <button onClick={handleAsk} className="ai-ask-button">
        Ask
      </button>

      <div className="ai-answer">
        {loading ? (
          <div className="typing-animation">
            <span>.</span><span>.</span><span>.</span>
          </div>
        ) : (
          answer && (
            <div
              className="answer-bubble"
              dangerouslySetInnerHTML={{ __html: highlightAnswer(answer) }}
            ></div>
          )
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
