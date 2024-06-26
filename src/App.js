import React, { useState } from 'react';
import Grid from './Grid';
import './App.css';

function App() {
  const [n, setN] = useState(10);
  const [k, setK] = useState(2);
  const [showGrid, setShowGrid] = useState(false);
  const [tileType, setTileType] = useState('start'); // Default to 'start'

  const handleStart = () => {
    if (n <= 0 || k < 0) {
      alert('Please enter valid positive integers for Grid Size and TNT Explosives.');
      return;
    }
    setShowGrid(true);
  };

  const handleNChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setN(value);
    } else {
      setN('');
    }
  };

  const handleKChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setK(value);
    } else {
      setK('');
    }
  };

  return (
    <div className="App">
      <h1>TNT Grid Pathfinding</h1>
      <table className="layout-table">
        <tbody>
          <tr>
            <td className="input-column">
              <div className="input-container">
                <label>
                  Grid Size (n):
                  <input
                    type="number"
                    value={n}
                    onChange={handleNChange}
                    min="2"
                    className="input-field"
                  />
                </label>
                <label>
                  TNT Explosives (k):
                  <input
                    type="number"
                    value={k}
                    onChange={handleKChange}
                    min="0"
                    className="input-field"
                  />
                </label>
              </div>
              <div className="button-container">
                <button className="start-button" onClick={handleStart}>Create Grid</button>
              </div>
              <div className="tile-buttons">
                <button
                  className={tileType === 'start' ? 'active' : ''}
                  onClick={() => setTileType('start')}
                >
                  Place Start
                </button>
                <button
                  className={tileType === 'wall' ? 'active' : ''}
                  onClick={() => setTileType('wall')}
                >
                  Place Wall
                </button>
                <button
                  className={tileType === 'finish' ? 'active' : ''}
                  onClick={() => setTileType('finish')}
                >
                  Place Finish
                </button>
              </div>
            </td>
            <td className="grid-column">
              <div className="grid-container">
                {showGrid && <Grid size={n} maxTNT={k} tileType={tileType} />}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;
