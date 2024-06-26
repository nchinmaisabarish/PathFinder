import React, { useState, useEffect } from 'react';
import './Grid.css';

const Grid = ({ size, maxTNT, tileType }) => {
  const initialGrid = Array(size).fill().map(() => Array(size).fill(0)); // Initial grid state

  const [grid, setGrid] = useState(initialGrid);
  const [start, setStart] = useState(null);
  const [finish, setFinish] = useState(null);
  const [walls, setWalls] = useState([]);
  const [tntCount, setTntCount] = useState(maxTNT);
  const [path, setPath] = useState([]);
  const [pathFound, setPathFound] = useState(true); // Track if path is found
  const [animationSpeed, setAnimationSpeed] = useState(200); // Animation speed in milliseconds

  // Reset grid whenever size or maxTNT changes
  useEffect(() => {
    resetGrid();
  }, [size, maxTNT]);

  const handleClick = (row, col) => {
    if (tileType === 'start') {
      toggleStart(row, col);
    } else if (tileType === 'finish') {
      toggleFinish(row, col);
    } else if (tileType === 'wall') {
      toggleWall(row, col);
    }
  };

  const toggleStart = (row, col) => {
    if (start && start[0] === row && start[1] === col) {
      // Clicked on an already placed start tile, so remove it
      setStart(null);
      updateGrid(row, col, 0);
    } else if (!start) {
      // Place new start tile if no start tile exists
      setStart([row, col]);
      updateGrid(row, col, 'S');
    }
  };

  const toggleFinish = (row, col) => {
    if (finish && finish[0] === row && finish[1] === col) {
      // Clicked on an already placed finish tile, so remove it
      setFinish(null);
      updateGrid(row, col, 0);
    } else if (!finish) {
      // Place new finish tile if no finish tile exists
      setFinish([row, col]);
      updateGrid(row, col, 'F');
    }
  };

  const toggleWall = (row, col) => {
    const currentCellValue = grid[row][col];
    if (currentCellValue === 'W') {
      // Clicked on an already placed wall, so remove it
      setWalls(prevWalls => prevWalls.filter(([r, c]) => !(r === row && c === col)));
      updateGrid(row, col, 0);
    } else if (currentCellValue === 0) {
      // Place new wall
      setWalls([...walls, [row, col]]);
      updateGrid(row, col, 'W');
    }
  };

  const useTNT = (row, col) => {
    if (grid[row][col] === 'W' && tntCount > 0) {
      setTntCount(prevCount => prevCount - 1); // Decrease TNT count
      updateGrid(row, col, 0); // Clear the wall
    }
  };    

  const updateGrid = (row, col, value) => {
    const newGrid = grid.map((r, rowIndex) =>
      r.map((cell, cellIndex) =>
        rowIndex === row && cellIndex === col ? value : cell
      )
    );
    setGrid(newGrid);
  };

  const findPath = async () => {
    // Clear previous path and exploring cells
    setPath([]);
    setPathFound(true); // Reset path found state
  
    if (!start || !finish) return;
  
    const directions = [
      [0, 1], [1, 0], [0, -1], [-1, 0]
    ];
  
    const queue = [[...start, 0, []]];
    const visited = new Set();
    visited.add(`${start[0]},${start[1]},0`);
  
    while (queue.length) {
      const [x, y, tntUsed, currentPath] = queue.shift();
  
      if (x === finish[0] && y === finish[1]) {
        setPath(currentPath);
        setPathFound(true); // Path found
        clearExploringCells(); // Clear exploring cells after path is found
        return;
      }
  
      await animateIteration(x, y);
  
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
  
        if (nx >= 0 && ny >= 0 && nx < size && ny < size) {
          const newTntUsed = tntUsed + (grid[nx][ny] === 'W' ? 1 : 0);
  
          if (newTntUsed <= maxTNT && !visited.has(`${nx},${ny},${newTntUsed}`)) {
            visited.add(`${nx},${ny},${newTntUsed}`);
            queue.push([nx, ny, newTntUsed, [...currentPath, [nx, ny]]]);
          }
        }
      }
  
      await sleep(animationSpeed); // Wait for animation speed
    }
  
    setPathFound(false); // No path found
  };
    

  const animateIteration = async (x, y) => {
    await sleep(animationSpeed); // Wait for animation speed
    updateGrid(x, y, 'X'); // Mark current cell being explored
  };

  const clearExploringCells = () => {
    const newGrid = grid.map(row =>
      row.map(cell =>
        cell === 'X' || cell === 'path' ? 0 : cell
      )
    );
    setGrid(newGrid);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const resetGrid = () => {
    setGrid(initialGrid);
    setStart(null);
    setFinish(null);
    setWalls([]);
    setTntCount(maxTNT);
    setPath([]);
    setPathFound(true); // Reset path found state
  };

  const handleContextMenu = (e, row, col) => {
    e.preventDefault(); // Prevent default context menu
    if (grid[row][col] === 'W' && tntCount > 0) {
      setTntCount(tntCount - 1);
      updateGrid(row, col, 0);
    }
  };

  return (
    <div className="grid">
      <div>Maximum Wall Breaking Can Be Done: {tntCount}</div>
      <button onClick={findPath}>Find Path</button>
      <button onClick={resetGrid}>Reset</button>
      {!pathFound && <div className="message">No path found</div>}
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, cellIndex) => {
            const isPath = path.some(([pRow, pCol]) => pRow === rowIndex && pCol === cellIndex);
            let cellClass = '';
            if (cell === 'S') cellClass = 'start';
            else if (cell === 'F') cellClass = 'finish';
            else if (cell === 'W') cellClass = 'wall';
            else if (cell === 'X') cellClass = 'exploring';
            else if (isPath) cellClass = 'path';
            return (
              <div
                key={cellIndex}
                className={`cell ${cellClass}`}
                onClick={() => handleClick(rowIndex, cellIndex)}
                onContextMenu={(e) => handleContextMenu(e, rowIndex, cellIndex)}
              >
                {/* Display different symbols or empty for different cell types */}
                {cell === 'S' ? 'S' : cell === 'F' ? 'F' : ''}
                {cell === 'W' && isPath && <div className="wall-overlay" />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Grid;
