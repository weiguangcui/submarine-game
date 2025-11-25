import React from 'react';
import blueSub from '../assets/blue_submarine.png';
import redSub from '../assets/red_submarine.png';
import blueTorpedo from '../assets/blue_torpedo.png';
import redTorpedo from '../assets/red_torpedo.png';

const Board = ({ board, players, torpedoes, dispatch, currentPlayer, phase, winner }) => {
    const gridSize = 15;

    const handleCellClick = (x, y) => {
        // Dispatch move or place action based on UI state (handled by parent or global state check)
        // For now, let's assume click = move if in MOVE phase
        // We need to know the phase. But Board props don't have it.
        // Let's pass 'phase' or handle logic in Game.jsx and pass a generic onCellClick?
        // Better: Pass dispatch and let reducer handle validity? 
        // No, reducer needs action type.
        // Let's just expose the click and let the user decide action via Controls or implicit state.
        // Actually, standard pattern: Click to move.
        dispatch({ type: 'MOVE_SUB', payload: { x, y } });
    };

    const renderCell = (x, y) => {
        const player = players.find(p => p.x === x && p.y === y);
        const torpedo = torpedoes.find(t => t.x === x && t.y === y);

        let content = null;
        let className = "cell";

        if (player) {
            const imgSrc = player.id === 0 ? blueSub : redSub;
            content = <img src={imgSrc} alt={`Player ${player.id + 1}`} className="submarine-img" />;

            // Highlight logic
            let statusClass = "";
            if (phase === 'GAME_OVER') {
                if (winner === player.id) statusClass = "winner";
                else statusClass = "loser";
            } else {
                if (currentPlayer === player.id) statusClass = "active-player";
                else statusClass = "inactive-player";
            }

            className += ` has-player ${statusClass}`;
        } else if (torpedo) {
            // Use blue torpedo for now, will add red later
            // Check owner to decide color
            const isBlue = torpedo.owner === 0;
            const imgSrc = isBlue ? blueTorpedo : redTorpedo;

            // Rotate based on direction?
            // torpedo.direction = { dx, dy }
            // Rotate based on direction
            let rotation = 0;
            const { dx, dy } = torpedo.direction;
            if (dx === 1 && dy === 0) rotation = 0;
            else if (dx === -1 && dy === 0) rotation = 180;
            else if (dx === 0 && dy === 1) rotation = 90;
            else if (dx === 0 && dy === -1) rotation = -90;
            else if (dx === 1 && dy === 1) rotation = 45;
            else if (dx === -1 && dy === 1) rotation = 135;
            else if (dx === 1 && dy === -1) rotation = -45;
            else if (dx === -1 && dy === -1) rotation = -135;

            // Adjust rotation for Red Torpedo because the base image is facing LEFT
            if (!isBlue) {
                rotation += 180;
            }

            content = (
                <img
                    src={imgSrc}
                    alt="Torpedo"
                    className="torpedo-img"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                    }}
                />
            );
            className += " has-torpedo";
        }

        return (
            <div
                key={`${x}-${y}`}
                className={className}
                onClick={() => handleCellClick(x, y)}
            >
                {content}
            </div>
        );
    };

    const grid = [];
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            grid.push(renderCell(x, y));
        }
    }

    return (
        <div className="board" style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            width: '600px',
            height: '600px',
            border: '2px solid #555',
            backgroundColor: '#001e36', // Deep ocean blue fallback
            // backgroundImage: 'url(...)' // Add texture later
        }}>
            {grid}
        </div>
    );
};

export default Board;
