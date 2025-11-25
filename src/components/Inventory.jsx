import React from 'react';

const Inventory = ({ player, isCurrent }) => {
    return (
        <div className={`inventory ${isCurrent ? 'active' : ''}`}>
            <h3>Player {player.id + 1}</h3>
            <ul>
                <li>Speed 1: {player.torpedoes.speed1}</li>
                <li>Speed 2: {player.torpedoes.speed2}</li>
                <li>Speed 5: {player.torpedoes.speed5}</li>
            </ul>
        </div>
    );
};

export default Inventory;
