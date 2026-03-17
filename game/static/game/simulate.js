let matchHistory = [];
let strategiesData = [];

document.addEventListener("DOMContentLoaded", function () {

    fetch("/strategies/")
    .then(response => response.json())
    .then(data => loadStrategies(data));

    document.querySelector("#run-sim").onclick = function () {

        const strategy1 = document.querySelector("#strategy1").value;
        const strategy2 = document.querySelector("#strategy2").value;
        const rounds = document.querySelector("#sim-rounds").value;
        const noisePercent = document.querySelector("#noise").value;
        const noise = noisePercent / 100;

        fetch("/simulate/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken()
            },
            body: JSON.stringify({
                strategy1: strategy1,
                strategy2: strategy2,
                rounds: rounds,
                noise: noise
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            showResults(data);
            document.querySelector("#results").scrollIntoView({behavior: "smooth"})
        });

    };

    //toggle rounds
    document.querySelector("#toggle-rounds").onclick = function () {
        const details = document.querySelector("#round-details");

        if (details.style.display ==="none") {
            details.style.display ="block";
            this.textContent = "Hide Round Details";
        } else {
            details.style.display = "none";
            this.textContent = "Show Round Details";
        }
    }

    //Run Tournament
    document.querySelector("#run-tournament").onclick = function () {
        const rounds = document.querySelector("#tournament-rounds").value;
        const noisePercent = document.querySelector("#tournament-noise").value;
        const noise = noisePercent / 100;

        fetch("/tournament/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken()
            },
            body: JSON.stringify({
                rounds: rounds,
                noise: noise
            })
        })
        .then(response => response.json())
        .then(data => {
            showLeaderboard(data.leaderboard);
            document.querySelector("#results").scrollIntoView({behavior: "smooth"})
        });
    }
    
    setTimeout(startExampleAnimation, 100);

});

function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

function showResults(data) {

    const resultsDiv = document.querySelector("#results");
    const roundResults = document.querySelector("#round-results");
    const detailsDiv = document.querySelector("#round-details");
    const toggleButton = document.querySelector("#toggle-rounds");

    // Clear old match if present
    const oldSummary = document.querySelector("#final-score");
    if (oldSummary) oldSummary.remove();
    const oldMatch = document.querySelector("#match-info");
    if (oldMatch) oldMatch.remove();

    // Clear old tournament leaderboard if present
    const oldLeaderboard = document.querySelector("#leaderboard");
    if (oldLeaderboard) oldLeaderboard.remove();

    roundResults.innerHTML = "";

    const finalRound = data[data.length - 1];

    // Get selected strategies (display names)
    const strategy1Name = document.querySelector("#strategy1").selectedOptions[0].text;
    const strategy2Name = document.querySelector("#strategy2").selectedOptions[0].text;

    // Save this match in the global history array
    matchHistory.push({
        s1: strategy1Name,
        s2: strategy2Name,
        score1: finalRound.score1,
        score2: finalRound.score2
    });

    // Update the match history panel
    updateHistory();

    // Create final score summary
    const summary = document.createElement("h3");
    summary.id = "final-score";
    summary.textContent = `Final Score: ${strategy1Name} = ${finalRound.score1} | ${strategy2Name} = ${finalRound.score2}`;
    resultsDiv.insertBefore(summary, toggleButton);

    // Create match info label
    const matchInfo = document.createElement("p");
    matchInfo.id = "match-info";
    matchInfo.textContent = `Match: ${strategy1Name} vs ${strategy2Name}`;
    resultsDiv.insertBefore(matchInfo, toggleButton);
    
    // Create legend for timeline visual
    const legend = document.createElement("div");
    legend.style.marginBottom = "10px";

    const coopBox = document.createElement("span");
    coopBox.style.display = "inline-block";
    coopBox.style.width = "12px";
    coopBox.style.height = "12px";
    coopBox.style.backgroundColor = "green";
    coopBox.style.marginRight = "5px";

    const defectBox = document.createElement("span");
    defectBox.style.display = "inline-block";
    defectBox.style.width = "12px";
    defectBox.style.height = "12px";
    defectBox.style.backgroundColor = "red";
    defectBox.style.marginRight = "5px";

    const coopLabel = document.createElement("span");
    coopLabel.textContent = " Cooperate ";

    const defectLabel = document.createElement("span");
    defectLabel.textContent = " Defect";

    legend.appendChild(coopBox);
    legend.appendChild(coopLabel);
    legend.appendChild(defectBox);
    legend.appendChild(defectLabel);

    roundResults.appendChild(legend);

    // Create rows for timeline
    const p1Row = document.createElement("div");
    const p2Row = document.createElement("div");

    p1Row.className = "timeline-row";
    p2Row.className = "timeline-row";

    p1Row.textContent = "Player 1: ";
    p2Row.textContent = "Player 2: ";

    data.forEach(round => {
        const box1 = document.createElement("span");
        const box2 = document.createElement("span");

        box1.className = "move-box";
        box2.className = "move-box";

        box1.classList.add(round.move1 === "C" ? "cooperate" : "defect");
        box2.classList.add(round.move2 === "C" ? "cooperate" : "defect");

        p1Row.appendChild(box1);
        p2Row.appendChild(box2);
    })

    roundResults.appendChild(p1Row);
    roundResults.appendChild(p2Row);

}

function showLeaderboard(leaderboard) {

    const resultsDiv = document.querySelector("#results");

    // Remove previous match results
    const oldMatch = document.querySelector("#match-info");
    if (oldMatch) oldMatch.remove();

    const oldScore = document.querySelector("#final-score");
    if (oldScore) oldScore.remove();

    document.querySelector("#round-results").innerHTML = "";
    document.querySelector("#round-details").style.display = "none";
    
    // Remove old leaderboard if it exists
    const oldLeaderboard = document.querySelector("#leaderboard");
    if (oldLeaderboard) oldLeaderboard.remove();

    // Remove old conclusion if it exists
    const oldConclusion = document.querySelector("#tournament-conclusion");
    if (oldConclusion) oldConclusion.remove();

    // Remove old strategy guide if it exists
    const oldGuide = document.querySelector("#strategy-guide");
    if (oldGuide) oldGuide.remove();

    const container = document.createElement("div");
    container.id = "leaderboard";

    const title = document.createElement("h2");
    title.textContent = "Tournament Results";
    const hint = document.createElement("p");
    hint.className = "hover-hint";
    hint.textContent = "Hover over a strategy name to see its description.";

    const list = document.createElement("ol");

    leaderboard.forEach(entry => {
        const strategyName = entry[0];
        const score = entry[1];

        const item = document.createElement("li");

        const strategy = strategiesData.find(s => s.id === strategyName);

        const nameSpan = document.createElement("span");
        nameSpan.className = "strategy-tooltip";
        nameSpan.textContent = strategyName;

        if (strategy) {
            const tooltip = document.createElement("span");
            tooltip.className = "tooltip-text";
            tooltip.textContent = strategy.description;

            nameSpan.appendChild(tooltip);
        }

        item.appendChild(nameSpan);
        item.appendChild(document.createTextNode(" : " + score));

        list.appendChild(item);
        });

    container.appendChild(title);
    container.appendChild(hint);
    container.appendChild(list);

    resultsDiv.appendChild(container);

    // Add conclusion/explanation under leaderboard
    const conclusion = document.createElement("div");
    conclusion.id = "tournament-conclusion";

    conclusion.innerHTML = `
        <h3>What the Tournament Tells Us</h3>
        <p>
            <a href="https://en.wikipedia.org/wiki/The_Evolution_of_Cooperation" target="_blank"> Professor Axelrod's original tournaments</a>  
            showed that the strategies that are <strong>nice</strong> (never defect first), 
            <strong>forgiving</strong> (willing to return to cooperation after a defection), or 
            <strong>retaliatory</strong> (punish defectors effectively) tend to score highest overall.
            Random strategies tend to perform poorly since it is hard to form any sort of trust. So 
            <strong>clear</strong> strategies with simple rules perform well.
        </p>
        <p>
            How do your results compare? It should be noted that results will always depend on what strategies are included.
    `;

    resultsDiv.appendChild(conclusion);

}

function startExampleAnimation() {

    const p1 = document.querySelector("#example-p1");
    const p2 = document.querySelector("#example-p2");
    const payoff = document.querySelector("#example-payoff");

    // Stop if the example section doesn't exist
    if (!p1 || !p2 || !payoff) return;

    const examples = [
        {p1:"C", p2:"C", payoff:"(3,3)"},
        {p1:"C", p2:"D", payoff:"(0,5)"},
        {p1:"D", p2:"C", payoff:"(5,0)"},
        {p1:"D", p2:"D", payoff:"(1,1)"}
    ];

    let index = 1;

    setInterval(() => {

        const example = examples[index];

        p1.textContent = example.p1;
        p2.textContent = example.p2;
        payoff.textContent = "Payoff: " + example.payoff;

        p1.className = example.p1 === "C" ? "example-cooperate" : "example-defect";
        p2.className = example.p2 === "C" ? "example-cooperate" : "example-defect";

        index = (index + 1) % examples.length;

    }, 2000);
}

function loadStrategies(strategies) {

    strategiesData = strategies;
    const s1 = document.querySelector("#strategy1");
    const s2 = document.querySelector("#strategy2");

    strategies.forEach(strategy => {

        const option1 = document.createElement("option");
        option1.value = strategy.id;
        option1.textContent = strategy.name;

        const option2 = option1.cloneNode(true);

        s1.appendChild(option1);
        s2.appendChild(option2);
    });

    updateDescriptions(strategies);

    s1.onchange = () => updateDescriptions(strategies);
    s2.onchange = () => updateDescriptions(strategies);
}

function updateDescriptions(strategies) {

    const s1 = document.querySelector("#strategy1").value;
    const s2 = document.querySelector("#strategy2").value;

    const desc1 = document.querySelector("#desc1");
    const desc2 = document.querySelector("#desc2");

    const strat1 = strategies.find(s => s.id === s1);
    const strat2 = strategies.find(s => s.id === s2);

    desc1.textContent = strat1 ? strat1.description : "";
    desc2.textContent = strat2 ? strat2.description : "";
}

function updateHistory() {

    const list = document.querySelector("#history-list");

    list.innerHTML = "";

    matchHistory.forEach(match => {

        const item = document.createElement("li");

        item.textContent =
            match.s1 + " vs " + match.s2 +
            " : " +
            match.score1 + " - " + match.score2;

        list.appendChild(item);
    });
}