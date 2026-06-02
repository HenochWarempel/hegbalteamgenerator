const dieHardsList = document.getElementById('dieHards');
const benchWarmersList = document.getElementById('benchWarmers');
const team1Element = document.getElementById('team1');
const team2Element = document.getElementById('team2');
const formTeamsButton = document.getElementById('formTeams');
const clearSelectionButton = document.getElementById('clearSelection');

const players = [
    { name: 'Bart', value: 5, type: 'benchWarmer' },
    { name: 'Danny', value: 2, type: 'dieHard' },
    { name: 'Gita', value: 2, type: 'benchWarmer' },
    { name: 'Henoch', value: 5, type: 'dieHard' },
    { name: 'Jaap', value: 4, type: 'benchWarmer' },
    { name: 'Kevin', value: 4, type: 'benchWarmer' },
    { name: 'Koen', value: 6, type: 'benchWarmer' },
    { name: 'Laureen', value: 2, type: 'dieHard' },
    { name: 'Marc', value: 5, type: 'dieHard' },
    { name: 'Marije', value: 2, type: 'benchWarmer' },
    { name: 'Mark', value: 5, type: 'dieHard' },
    { name: 'Maud', value: 2, type: 'dieHard' },
    { name: 'Nora', value: 2, type: 'benchWarmer' },
    { name: 'Pascal', value: 2, type: 'benchWarmer' },
    { name: 'Remco', value: 3, type: 'dieHard' },
    { name: 'Sander', value: 4, type: 'benchWarmer' },
    { name: 'Simon', value: 6, type: 'dieHard' },
    { name: 'Suze', value: 3, type: 'dieHard' },
    { name: 'Tim', value: 5, type: 'dieHard' },
    { name: 'Tom', value: 4, type: 'benchWarmer' },
];

const selectedPlayers = new Set();
const participantElements = new Map();
let totalValueTeam1 = 0;
let totalValueTeam2 = 0;

function addPlayerToList(player, listElement) {
    const button = document.createElement('button');
    button.textContent = player.name;
    button.classList.add('player-button');
    listElement.appendChild(button);

    button.addEventListener('click', () => {
        if (!selectedPlayers.has(player)) {
            selectedPlayers.add(player);
            button.classList.add('selected');

            const participantNameDiv = document.createElement('div');
            participantNameDiv.textContent = player.name;
            participantNameDiv.classList.add('participant-name');
            participantNameDiv.dataset.playerName = player.name;

            participantNameDiv.addEventListener('click', () => {
                selectedPlayers.delete(player);
                participantNameDiv.remove();
                participantElements.delete(player.name);
                button.classList.remove('selected');
            });

            participantElements.set(player.name, participantNameDiv);
        } else {
            selectedPlayers.delete(player);
            button.classList.remove('selected');
            if (participantElements.has(player.name)) {
                participantElements.get(player.name).remove();
                participantElements.delete(player.name);
            }
        }
    });
}

players.forEach(player => {
    if (player.type === 'dieHard') {
        addPlayerToList(player, dieHardsList);
    } else if (player.type === 'benchWarmer') {
        addPlayerToList(player, benchWarmersList);
    } else {
        console.warn(`Speler ${player.name} niet gevonden in dieHards of benchWarmers lijsten en wordt niet getoond.`);
    }
});

formTeamsButton.addEventListener('click', () => {
    generateFairTeams(Array.from(selectedPlayers));
});

clearSelectionButton.addEventListener('click', () => {
    selectedPlayers.clear();
    dieHardsList.querySelectorAll('.player-button').forEach(button => button.classList.remove('selected'));
    benchWarmersList.querySelectorAll('.player-button').forEach(button => button.classList.remove('selected'));
    team1Element.innerHTML = '';
    team2Element.innerHTML = '';
    totalValueTeam1 = 0;
    totalValueTeam2 = 0;
});


function generateFairTeams(players) {
    if (players.length < 2) {
        alert("Selecteer minimaal 2 spelers om teams te vormen.");
        return;
    }

    let bestTeam1Players = [];
    let bestTeam2Players = [];
    let bestDifference = Infinity;

    let bestTotalValueTeam1 = 0;
    let bestTotalValueTeam2 = 0;

    const MAX_ITERATIONS = 5000;
    const team1Size = Math.floor(players.length / 2);

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        const SHUFFLED_PLAYERS = shuffleArray(players.slice());
        const CURRENT_TEAM_1 = SHUFFLED_PLAYERS.slice(0, team1Size);
        const CURRENT_TEAM_2 = SHUFFLED_PLAYERS.slice(team1Size);

        // Vergelijk gemiddelden zodat teams met een wisselspeler eerlijk worden beoordeeld.
        // Bij 7 spelers (3+1 wissel vs 3): elke speler in het team van 4 speelt 3/4 van de tijd,
        // dus de verwachte veldbezetting = gemiddelde van alle 4 — gelijk aan het gemiddelde van team B.
        const CURRENT_VALUE_1 = calculateAverageValue(CURRENT_TEAM_1);
        const CURRENT_VALUE_2 = calculateAverageValue(CURRENT_TEAM_2);
        const CURRENT_DIFFERENCE = Math.abs(CURRENT_VALUE_1 - CURRENT_VALUE_2);

        if (CURRENT_DIFFERENCE < bestDifference) {
            bestDifference = CURRENT_DIFFERENCE;
            bestTeam1Players = CURRENT_TEAM_1;
            bestTeam2Players = CURRENT_TEAM_2;
            bestTotalValueTeam1 = CURRENT_VALUE_1;
            bestTotalValueTeam2 = CURRENT_VALUE_2;

            if (bestDifference === 0) {
                break;
            }
        }
    }

    totalValueTeam1 = bestTotalValueTeam1;
    totalValueTeam2 = bestTotalValueTeam2;

    displayTeams(bestTeam1Players, bestTeam2Players);
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function calculateTotalValue(teamPlayers) {
    if (!teamPlayers || teamPlayers.length === 0) return 0;
    return teamPlayers.reduce((sum, player) => sum + player.value, 0);
}

function calculateAverageValue(teamPlayers) {
    if (!teamPlayers || teamPlayers.length === 0) return 0;
    return calculateTotalValue(teamPlayers) / teamPlayers.length;
}

function displayTeams(team1Players, team2Players) {
    const hasSubTeam1 = team1Players.length > team2Players.length;
    const hasSubTeam2 = team2Players.length > team1Players.length;

    team1Element.innerHTML = `<h3>Team Stoep${hasSubTeam1 ? ' <span class="sub-badge">wisselspeler</span>' : ''}</h3>`;
    team2Element.innerHTML = `<h3>Team Zand${hasSubTeam2 ? ' <span class="sub-badge">wisselspeler</span>' : ''}</h3>`;

    function renderPlayers(teamPlayers, hasSubstitute, container) {
        // De zwakste speler begint op de bank — zo zijn de eerste 3 op het veld
        // zo sterk mogelijk ten opzichte van het team zonder wissel.
        const sorted = hasSubstitute
            ? [...teamPlayers].sort((a, b) => a.value - b.value)
            : teamPlayers;
        const subPlayer = hasSubstitute ? sorted[0] : null;
        const fieldPlayers = hasSubstitute ? sorted.slice(1) : sorted;

        fieldPlayers.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.textContent = player.name;
            container.appendChild(playerDiv);
        });

        if (subPlayer) {
            const subDiv = document.createElement('div');
            subDiv.innerHTML = `<span class="sub-player">⇄ ${subPlayer.name} (wissel)</span>`;
            container.appendChild(subDiv);
        }
    }

    renderPlayers(team1Players, hasSubTeam1, team1Element);
    renderPlayers(team2Players, hasSubTeam2, team2Element);

    const team1Stats = document.createElement('p');
    team1Stats.innerHTML = `<strong>Spelers op veld:</strong> ${Math.min(team1Players.length, team2Players.length)}<br><strong>Gemiddelde score:</strong> ${totalValueTeam1.toFixed(2)}`;
    team1Element.appendChild(team1Stats);

    const team2Stats = document.createElement('p');
    team2Stats.innerHTML = `<strong>Spelers op veld:</strong> ${Math.min(team1Players.length, team2Players.length)}<br><strong>Gemiddelde score:</strong> ${totalValueTeam2.toFixed(2)}`;
    team2Element.appendChild(team2Stats);
}
