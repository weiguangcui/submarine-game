import React, { useState } from 'react';

const Controls = ({ state, dispatch }) => {
  const [selectedSpeed, setSelectedSpeed] = useState(1);
  const [selectedDirection, setSelectedDirection] = useState({ dx: 1, dy: 0 }); // Default Right

  const handleRoll = () => {
    dispatch({ type: 'ROLL_DICE' });
  };

  const handleEndTurn = () => {
    dispatch({ type: 'END_TURN' });
  };

  const handleSkipMove = () => {
    dispatch({ type: 'SKIP_MOVE' });
  };

  const handlePlaceTorpedo = () => {
    // For simplicity, place at current player location (or we need a UI to select target?)
    // Rules: "laugh one torpedo at each passed-by space".
    // Let's allow placing at current location for now.
    const player = state.players[state.currentPlayer];
    dispatch({
      type: 'PLACE_TORPEDO',
      payload: {
        x: player.x,
        y: player.y,
        speed: selectedSpeed,
        direction: selectedDirection
      }
    });
  };

  return (
    <div className="controls" style={{ padding: '1rem', border: '1px solid #444', marginTop: '1rem' }}>
      <div className="status">
        <p>Phase: <strong>{state.phase}</strong></p>
        <p>Current Player: <strong>Player {state.currentPlayer + 1}</strong></p>
        {state.diceRoll && <p>Dice Roll: {state.diceRoll}</p>}
        {state.movesRemaining > 0 && <p>Moves Remaining: {state.movesRemaining}</p>}
      </div>

      <div className="actions">
        <button onClick={handleRoll} disabled={state.phase !== 'ROLL'}>Roll Dice</button>
        <button onClick={handleSkipMove} disabled={state.phase !== 'MOVE'}>Stop Moving</button>

        <div className="torpedo-controls" style={{ marginTop: '1rem', borderTop: '1px solid #555', paddingTop: '0.5rem' }}>
          <h4>Torpedo Launcher</h4>
          <label>
            Speed:
            <select value={selectedSpeed} onChange={(e) => setSelectedSpeed(Number(e.target.value))}>
              <option value={1}>Speed 1</option>
              <option value={2}>Speed 2</option>
              <option value={5}>Speed 5</option>
            </select>
          </label>
          <br />
          <label>
            Direction:
            <select onChange={(e) => {
              const [dx, dy] = e.target.value.split(',').map(Number);
              setSelectedDirection({ dx, dy });
            }}>
              <option value="1,0">Right</option>
              <option value="-1,0">Left</option>
              <option value="0,1">Down</option>
              <option value="0,-1">Up</option>
              <option value="1,1">Down-Right</option>
              <option value="-1,1">Down-Left</option>
              <option value="1,-1">Up-Right</option>
              <option value="-1,-1">Up-Left</option>
            </select>
          </label>
          <br />
          <button onClick={handlePlaceTorpedo} disabled={state.phase === 'ROLL' || state.phase === 'RESOLVE' || state.phase === 'GAME_OVER'}>
            Place Torpedo
          </button>
        </div>

        <button onClick={handleEndTurn} disabled={state.phase === 'GAME_OVER'} style={{ marginTop: '1rem', backgroundColor: '#d32f2f' }}>End Turn</button>
      </div>

      <div className="logs" style={{ marginTop: '1rem', maxHeight: '150px', overflowY: 'auto', textAlign: 'left', fontSize: '0.8rem' }}>
        {state.logs.slice(-5).map((log, i) => <div key={i}>{log}</div>)}
      </div>
    </div>
  );
};

export default Controls;
