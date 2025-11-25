export const initialState = {
    board: Array(15).fill(null).map(() => Array(15).fill(null)),
    players: [
        { id: 0, x: 0, y: 0, torpedoes: { speed1: 10, speed2: 5, speed5: 1 }, alive: true, color: 'blue' },
        { id: 1, x: 14, y: 14, torpedoes: { speed1: 10, speed2: 5, speed5: 1 }, alive: true, color: 'red' }
    ],
    currentPlayer: 0,
    phase: 'ROLL', // ROLL, MOVE, PLACE_TORPEDO, RESOLVE
    diceRoll: null,
    movesRemaining: 0,
    torpedoes: [], // { x, y, direction, speed, owner }
    logs: []
};

export const gameReducer = (state, action) => {
    switch (action.type) {
        case 'ROLL_DICE': {
            if (state.phase !== 'ROLL') return state;
            const roll = Math.floor(Math.random() * 6) + 1;

            // Check if player is trapped immediately after roll? 
            // Or just let them try to move?
            // "If the submarine can not be moved, its player is out."
            // Let's check if they have ANY valid neighbor.
            const player = state.players[state.currentPlayer];
            const hasValidMove = [
                { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
                { dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: -1 } // 8-way
            ].some(dir => {
                const nx = player.x + dir.dx;
                const ny = player.y + dir.dy;
                if (nx < 0 || nx >= 15 || ny < 0 || ny >= 15) return false;
                // Check torpedoes
                if (state.torpedoes.some(t => t.x === nx && t.y === ny)) return false;
                // Check other player
                if (state.players.some(p => p.id !== state.currentPlayer && p.x === nx && p.y === ny)) return false;
                return true;
            });

            if (!hasValidMove) {
                return {
                    ...state,
                    diceRoll: roll,
                    phase: 'GAME_OVER',
                    winner: (state.currentPlayer + 1) % 2,
                    logs: [...state.logs, `Player ${state.currentPlayer + 1} is trapped! Game Over.`]
                };
            }

            return {
                ...state,
                diceRoll: roll,
                movesRemaining: roll,
                phase: 'MOVE',
                logs: [...state.logs, `Player ${state.currentPlayer + 1} rolled a ${roll}`]
            };
        }

        case 'MOVE_SUB': {
            if (state.phase !== 'MOVE' || state.movesRemaining <= 0) return state;
            const { x, y } = action.payload;
            const currentPlayer = state.players[state.currentPlayer];

            // Validate move (adjacent only, not diagonal for now, or allow diagonal? Rules say "any direction", usually implies 8 directions or just adjacent. Let's assume adjacent for grid movement simplicity first, or 8-way if "any". Let's stick to 4-way for standard grid movement unless specified otherwise. "Any direction" on a board usually means adjacent squares. Let's allow 8-way for more freedom if "any" is interpreted broadly, but 4-way is safer for "steps". Let's do 4-way for now: Up, Down, Left, Right.)
            // Actually "any direction" could mean diagonal too. Let's allow 8-way.
            const dx = Math.abs(x - currentPlayer.x);
            const dy = Math.abs(y - currentPlayer.y);
            if (dx > 1 || dy > 1 || (dx === 0 && dy === 0)) return state; // Must be adjacent

            // Check collisions with other submarines
            const otherPlayer = state.players.find(p => p.id !== state.currentPlayer);
            if (otherPlayer.x === x && otherPlayer.y === y) return state;

            // Check collisions with torpedoes (cannot go over torpedoes)
            const hitTorpedo = state.torpedoes.find(t => t.x === x && t.y === y);
            if (hitTorpedo) return state;

            const newPlayers = state.players.map(p =>
                p.id === state.currentPlayer ? { ...p, x, y } : p
            );

            return {
                ...state,
                players: newPlayers,
                movesRemaining: state.movesRemaining - 1,
                // Stay in MOVE phase until moves run out or user skips
                phase: state.movesRemaining - 1 === 0 ? 'PLACE_TORPEDO' : 'MOVE',
                logs: [...state.logs, `Player ${state.currentPlayer + 1} moved to (${x}, ${y})`]
            };
        }

        case 'SKIP_MOVE': {
            if (state.phase !== 'MOVE') return state;
            return {
                ...state,
                movesRemaining: 0,
                phase: 'PLACE_TORPEDO',
                logs: [...state.logs, `Player ${state.currentPlayer + 1} stopped moving`]
            }
        }

        case 'PLACE_TORPEDO': {
            // Allow placement in MOVE or PLACE_TORPEDO phase
            if (state.phase !== 'MOVE' && state.phase !== 'PLACE_TORPEDO') return state;

            const { speed, direction, x, y } = action.payload;
            const player = state.players[state.currentPlayer];
            const speedKey = `speed${speed}`;

            if (player.torpedoes[speedKey] <= 0) return state;

            const newTorpedo = {
                x, y,
                speed,
                direction, // { dx, dy }
                owner: state.currentPlayer,
                id: Date.now() + Math.random()
            };

            const newPlayers = state.players.map(p =>
                p.id === state.currentPlayer
                    ? { ...p, torpedoes: { ...p.torpedoes, [speedKey]: p.torpedoes[speedKey] - 1 } }
                    : p
            );

            return {
                ...state,
                torpedoes: [...state.torpedoes, newTorpedo],
                players: newPlayers,
                logs: [...state.logs, `Player ${state.currentPlayer + 1} placed Speed ${speed} torpedo`]
            };
        }

        case 'END_TURN': {
            const nextPlayer = (state.currentPlayer + 1) % 2;
            // If next player is 0, that means a full round has passed (0 -> 1 -> 0)
            // So if nextPlayer === 0, we resolve torpedo movement.

            let newState = {
                ...state,
                currentPlayer: nextPlayer,
                phase: 'ROLL',
                diceRoll: null,
                movesRemaining: 0,
                logs: [...state.logs, `Player ${state.currentPlayer + 1} ended turn`]
            };

            if (nextPlayer === 0) {
                // Resolve Round
                // Move all torpedoes
                // Check collisions
                // Remove out of bounds

                // This is complex, maybe separate function?
                // For now, let's just move them one step or full speed?
                // "distance it will move depending on its speed".
                // So speed 1 = 1 tile, speed 2 = 2 tiles.

                // We need to handle this in a separate helper or here.
                // Let's do a simple update here.

                let currentTorpedoes = [...state.torpedoes];
                let currentPlayers = [...state.players];
                let gameLogs = [...newState.logs, "--- Round Resolution ---"];

                // Move torpedoes
                // We need to handle collision at EACH step of the speed.
                // e.g. Speed 2: Move 1 step, check hit, Move 2nd step, check hit.

                let survivingTorpedoes = [];

                // Process each torpedo
                for (let t of currentTorpedoes) {
                    let tx = t.x;
                    let ty = t.y;
                    let hit = false;
                    let outOfBounds = false;

                    for (let step = 0; step < t.speed; step++) {
                        tx += t.direction.dx;
                        ty += t.direction.dy;

                        // Check Out of Bounds
                        if (tx < 0 || tx >= 15 || ty < 0 || ty >= 15) {
                            outOfBounds = true;
                            // Recycle? "If the torpedo moves out of the board, the player can recycle it."
                            // Add back to inventory.
                            currentPlayers = currentPlayers.map(p => {
                                if (p.id === t.owner) {
                                    const speedKey = `speed${t.speed}`;
                                    return { ...p, torpedoes: { ...p.torpedoes, [speedKey]: p.torpedoes[speedKey] + 1 } };
                                }
                                return p;
                            });
                            gameLogs.push(`Torpedo leaving board recycled for Player ${t.owner + 1}`);
                            break; // Stop moving this torpedo
                        }

                        // Check Collision with Players
                        for (let p of currentPlayers) {
                            if (p.x === tx && p.y === ty) {
                                // HIT!
                                currentPlayers = currentPlayers.map(pl => pl.id === p.id ? { ...pl, alive: false } : pl);
                                hit = true;
                                gameLogs.push(`Player ${p.id + 1} was hit by a torpedo!`);
                            }
                        }

                        if (hit) break;
                    }

                    if (!hit && !outOfBounds) {
                        survivingTorpedoes.push({ ...t, x: tx, y: ty });
                    }
                }

                newState = {
                    ...newState,
                    players: currentPlayers,
                    torpedoes: survivingTorpedoes,
                    logs: gameLogs
                };

                // Check for Game Over
                const deadPlayers = currentPlayers.filter(p => !p.alive);
                if (deadPlayers.length > 0) {
                    newState.phase = 'GAME_OVER';
                    const winner = currentPlayers.find(p => p.alive);
                    newState.winner = winner ? winner.id : 'DRAW';
                    newState.logs.push(winner ? `Game Over! Player ${winner.id + 1} Wins!` : "Game Over! It's a Draw!");
                }
            }

            return newState;
        }

        default:
            return state;
    }
};
