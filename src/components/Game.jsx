import React, { useReducer } from 'react';
import { initialState, gameReducer } from '../logic/gameState';
import Board from './Board';
import Controls from './Controls';
import Inventory from './Inventory';

const Game = () => {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    return (
        <div className="game-container">
            <h1>Submarine Duel</h1>
            <div className="game-layout">
                <div className="sidebar">
                    <Inventory player={state.players[0]} isCurrent={state.currentPlayer === 0} />
                    <Inventory player={state.players[1]} isCurrent={state.currentPlayer === 1} />
                </div>
                <Board
                    board={state.board}
                    players={state.players}
                    torpedoes={state.torpedoes}
                    dispatch={dispatch}
                    currentPlayer={state.currentPlayer}
                    phase={state.phase}
                    winner={state.winner}
                />
                <Controls state={state} dispatch={dispatch} />
            </div>
        </div>
    );
};

export default Game;
