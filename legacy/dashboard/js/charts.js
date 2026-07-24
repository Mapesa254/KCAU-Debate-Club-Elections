/**
 * charts.js — All Plotly.js interactive chart renderings
 * Each function creates one chart in the specified container.
 */

const Charts = {
    /**
     * Render all overview charts
     */
    renderAll(data) {
        this.overallVoteShare(data);
        this.turnoutPie(data);
        this.votesByPosition(data);
        this.registeredVsCast(data);
        this.validVsInvalid(data);
        this.topPositionsByTurnout(data);
        this.candidateRanking(data);
    },

    /**
     * Re-render all charts (e.g., on theme change)
     */
    refreshAll(data) {
        // Purge and re-render
        const chartIds = [
            'chartVoteShare', 'chartTurnoutPie',
            'chartVotesByPosition', 'chartRegisteredVsCast',
            'chartValidInvalid', 'chartTopPositions', 'chartCandidateRanking'
        ];
        chartIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) Plotly.purge(el);
        });
        this.renderAll(data);
    },

    // ─── 1. Candidate Vote Comparison (Horizontal Bar) ─────────────
    candidateVoteComparison(data) {
        const candidates = data.allCandidates
            .slice()
            .sort((a, b) => a.votes - b.votes);

        const theme = Utils.getPlotlyTheme();
        const colors = candidates.map(c => theme.colorway[0]);

        const trace = {
            type: 'bar',
            orientation: 'h',
            y: candidates.map(c => `${c.name} (${c.position})`),
            x: candidates.map(c => c.votes),
            text: candidates.map(c => `${c.votes} votes (${c.percentage}%)`),
            textposition: 'outside',
            textfont: { size: 11, family: 'Inter' },
            marker: {
                color: colors,
                line: { width: 0 },
                opacity: 0.9
            },
            hovertemplate: '<b>%{y}</b><br>Votes: %{x}<br>Share: %{text}<extra></extra>'
        };

        const layout = {
            ...theme,
            margin: { l: 20, r: 20, t: 20, b: 40 },
            xaxis: { ...theme.xaxis, title: 'Number of Votes', dtick: 5, automargin: true },
            yaxis: { ...theme.yaxis, automargin: true },
            hoverlabel: { bgcolor: '#1e293b', font: { color: '#f1f5f9', family: 'Inter' } },
            bargap: 0.3
        };

        Plotly.newPlot('chartCandidateVotes', [trace], layout, Utils.plotlyConfig);
    },

    // ─── 2. Overall Vote Share (Donut Chart) ───────────────────────
    overallVoteShare(data) {
        const candidates = data.allCandidates.filter(c => {
            // Only show contested positions for vote share
            const pos = data.positionResults.find(p => p.position === c.position);
            return pos && !pos.isUncontested;
        });

        const theme = Utils.getPlotlyTheme();

        const trace = {
            type: 'pie',
            labels: candidates.map(c => `${c.name}`),
            values: candidates.map(c => c.votes),
            hole: 0.55,
            textinfo: 'label+percent',
            textposition: 'outside',
            textfont: { size: 11, family: 'Inter' },
            marker: {
                colors: theme.colorway,
                line: { color: theme.paper_bgcolor === 'rgba(0,0,0,0)' ? '#0a0e1a' : '#ffffff', width: 2 }
            },
            hovertemplate: '<b>%{label}</b><br>Votes: %{value}<br>Share: %{percent}<extra></extra>',
            pull: candidates.map((c, i) => i === 0 ? 0.05 : 0),
            rotation: -30
        };

        const layout = {
            ...theme,
            margin: { l: 20, r: 20, t: 20, b: 20 },
            showlegend: true,
            legend: {
                orientation: 'h',
                y: -0.15,
                x: 0.5,
                xanchor: 'center',
                font: { size: 10, family: 'Inter', color: theme.font.color }
            },
            annotations: [{
                text: 'Contested<br>Positions',
                showarrow: false,
                font: { size: 13, family: 'Outfit', color: theme.font.color, weight: 'bold' },
                x: 0.5, y: 0.5
            }]
        };

        Plotly.newPlot('chartVoteShare', [trace], layout, Utils.plotlyConfig);
    },

    // ─── 3. Turnout vs Non-Turnout (Pie Chart) ────────────────────
    turnoutPie(data) {
        const k = data.kpis;
        const theme = Utils.getPlotlyTheme();

        const trace = {
            type: 'pie',
            labels: ['Voted', 'Did Not Vote'],
            values: [k.registeredWhoVoted, k.membersWhoDidNotVote],
            textinfo: 'label+value+percent',
            textposition: 'inside',
            textfont: { size: 13, family: 'Inter', color: '#ffffff' },
            marker: {
                colors: [theme.colorway[0], theme.colorway[3]],
                line: { color: theme.paper_bgcolor === 'rgba(0,0,0,0)' ? '#0a0e1a' : '#ffffff', width: 2 }
            },
            hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>%{percent}<extra></extra>',
            pull: [0.03, 0.03]
        };

        const layout = {
            ...theme,
            margin: { l: 20, r: 20, t: 20, b: 40 },
            showlegend: true,
            legend: {
                orientation: 'h',
                y: -0.1,
                x: 0.5,
                xanchor: 'center',
                font: { size: 11, family: 'Inter', color: theme.font.color }
            }
        };

        Plotly.newPlot('chartTurnoutPie', [trace], layout, Utils.plotlyConfig);
    },

    // ─── 4. Votes by Position (Bar Chart) ──────────────────────────
    votesByPosition(data) {
        const positions = data.positionResults;
        const theme = Utils.getPlotlyTheme();

        const trace = {
            type: 'bar',
            x: positions.map(p => p.position),
            y: positions.map(p => p.totalVotes),
            text: positions.map(p => p.totalVotes),
            textposition: 'outside',
            textfont: { size: 12, family: 'Outfit', weight: 'bold' },
            marker: {
                color: theme.colorway[0],
                opacity: 0.9,
                line: { width: 0 }
            },
            hovertemplate: '<b>%{x}</b><br>Total Votes: %{y}<br>Candidates: %{customdata}<extra></extra>',
            customdata: positions.map(p => p.totalCandidates)
        };

        const layout = {
            ...theme,
            margin: { l: 20, r: 20, t: 20, b: 40 },
            xaxis: { ...theme.xaxis, tickangle: -25, automargin: true },
            yaxis: { ...theme.yaxis, title: 'Total Votes', automargin: true },
            hoverlabel: { bgcolor: '#1e293b', font: { color: '#f1f5f9', family: 'Inter' } },
            bargap: 0.35
        };

        Plotly.newPlot('chartVotesByPosition', [trace], layout, Utils.plotlyConfig);
    },

    // ─── 5. Turnout by Year of Study ───────────────────────────────
    turnoutByYear(data) {
        const yearData = data.yearOfStudyData;
        const theme = Utils.getPlotlyTheme();

        const traceRegistered = {
            type: 'bar',
            name: 'Registered',
            x: yearData.map(y => y.year),
            y: yearData.map(y => y.registered),
            marker: { color: theme.colorway[3], opacity: 0.7 },
            hovertemplate: '<b>%{x}</b><br>Registered: %{y}<extra></extra>'
        };

        const traceVoted = {
            type: 'bar',
            name: 'Voted',
            x: yearData.map(y => y.year),
            y: yearData.map(y => y.voted),
            marker: { color: theme.colorway[0], opacity: 0.9 },
            hovertemplate: '<b>%{x}</b><br>Voted: %{y}<br>Turnout: %{customdata}%<extra></extra>',
            customdata: yearData.map(y => y.turnoutPercent)
        };

        const layout = {
            ...theme,
            margin: { l: 20, r: 20, t: 20, b: 40 },
            barmode: 'group',
            xaxis: { ...theme.xaxis, title: 'Year of Study', automargin: true },
            yaxis: { ...theme.yaxis, title: 'Count', automargin: true },
            legend: {
                orientation: 'h', y: 1.12, x: 0.5, xanchor: 'center',
                font: { size: 11, family: 'Inter', color: theme.font.color }
            },
            hoverlabel: { bgcolor: '#1e293b', font: { color: '#f1f5f9', family: 'Inter' } },
            bargap: 0.3
        };

        Plotly.newPlot('chartTurnoutByYear', [traceRegistered, traceVoted], layout, Utils.plotlyConfig);
    },

    // ─── 6. Registered Members vs Votes Cast ───────────────────────
    registeredVsCast(data) {
        const k = data.kpis;
        const theme = Utils.getPlotlyTheme();

        const trace = {
            type: 'bar',
            x: ['Registered Members', 'Votes Cast', 'Members Who Voted'],
            y: [k.totalRegistered, k.totalVotesCast, k.registeredWhoVoted],
            text: [k.totalRegistered, k.totalVotesCast, k.registeredWhoVoted],
            textposition: 'outside',
            textfont: { size: 14, family: 'Outfit', weight: 'bold' },
            marker: {
                color: [theme.colorway[3], theme.colorway[2], theme.colorway[0]],
                opacity: 0.9
            },
            hovertemplate: '<b>%{x}</b><br>Count: %{y}<extra></extra>'
        };

        const layout = {
            ...theme,
            margin: { l: 20, r: 20, t: 20, b: 40 },
            xaxis: { ...theme.xaxis, automargin: true },
            yaxis: { ...theme.yaxis, title: 'Count', automargin: true },
            hoverlabel: { bgcolor: '#1e293b', font: { color: '#f1f5f9', family: 'Inter' } },
            bargap: 0.4
        };

        Plotly.newPlot('chartRegisteredVsCast', [trace], layout, Utils.plotlyConfig);
    },

    // ─── 7. Valid vs Invalid Votes ─────────────────────────────────
    validVsInvalid(data) {
        const k = data.kpis;
        const theme = Utils.getPlotlyTheme();

        const trace = {
            type: 'bar',
            x: ['Valid Votes', 'Invalid Votes'],
            y: [k.totalValidVotes, k.totalInvalidVotes],
            text: [k.totalValidVotes, k.totalInvalidVotes],
            textposition: 'outside',
            textfont: { size: 14, family: 'Outfit', weight: 'bold' },
            marker: {
                color: [theme.colorway[0], theme.colorway[3]],
                opacity: 0.9
            },
            hovertemplate: '<b>%{x}</b><br>Count: %{y}<extra></extra>',
            width: [0.4, 0.4]
        };

        const layout = {
            ...theme,
            margin: { l: 20, r: 20, t: 20, b: 40 },
            xaxis: { ...theme.xaxis, automargin: true },
            yaxis: { ...theme.yaxis, title: 'Count', range: [0, Math.max(k.totalValidVotes, k.totalInvalidVotes) * 1.2], automargin: true },
            hoverlabel: { bgcolor: '#1e293b', font: { color: '#f1f5f9', family: 'Inter' } },
            bargap: 0.5
        };

        Plotly.newPlot('chartValidInvalid', [trace], layout, Utils.plotlyConfig);
    },

    // ─── 8. Top Performing Positions by Turnout ────────────────────
    topPositionsByTurnout(data) {
        const positions = data.positionResults
            .slice()
            .sort((a, b) => b.totalVotes - a.totalVotes);

        const theme = Utils.getPlotlyTheme();

        const trace = {
            type: 'bar',
            orientation: 'h',
            y: positions.map(p => p.position),
            x: positions.map(p => p.totalVotes),
            text: positions.map(p => `${p.totalVotes} votes`),
            textposition: 'outside',
            textfont: { size: 11, family: 'Inter' },
            marker: {
                color: theme.colorway[0],
                opacity: 0.9
            },
            hovertemplate: '<b>%{y}</b><br>Total Votes: %{x}<extra></extra>'
        };

        const layout = {
            ...theme,
            margin: { l: 20, r: 20, t: 20, b: 40 },
            xaxis: { ...theme.xaxis, title: 'Total Votes', automargin: true },
            yaxis: { ...theme.yaxis, automargin: true },
            hoverlabel: { bgcolor: '#1e293b', font: { color: '#f1f5f9', family: 'Inter' } },
            bargap: 0.35
        };

        Plotly.newPlot('chartTopPositions', [trace], layout, Utils.plotlyConfig);
    },

    // ─── 9. Candidate Overall Ranking ──────────────────────────────
    candidateRanking(data) {
        const candidates = data.allCandidates
            .slice()
            .sort((a, b) => b.votes - a.votes);

        const theme = Utils.getPlotlyTheme();

        const trace = {
            type: 'bar',
            x: candidates.map(c => c.name),
            y: candidates.map(c => c.votes),
            text: candidates.map(c => `${c.votes} (${c.percentage}%)`),
            textposition: 'outside',
            textfont: { size: 11, family: 'Inter' },
            marker: {
                color: candidates.map(c => c.isWinner ? theme.colorway[0] : theme.colorway[3]),
                opacity: 0.9,
                line: { width: 0 }
            },
            hovertemplate: '<b>%{x}</b><br>Position: %{customdata}<br>Votes: %{y}<extra></extra>',
            customdata: candidates.map(c => c.position)
        };

        const layout = {
            ...theme,
            margin: { l: 20, r: 20, t: 20, b: 60 },
            xaxis: { ...theme.xaxis, tickangle: -30, automargin: true },
            yaxis: { ...theme.yaxis, title: 'Votes', automargin: true },
            hoverlabel: { bgcolor: '#1e293b', font: { color: '#f1f5f9', family: 'Inter' } },
            bargap: 0.3
        };

        Plotly.newPlot('chartCandidateRanking', [trace], layout, Utils.plotlyConfig);
    },

    // ─── Position-Level Charts ─────────────────────────────────────

    /**
     * Render a ranking bar chart for a specific position
     */
    positionRankingChart(containerId, positionData) {
        const theme = Utils.getPlotlyTheme();
        const candidates = positionData.candidates.slice().sort((a, b) => a.votes - b.votes);

        const trace = {
            type: 'bar',
            orientation: 'h',
            y: candidates.map(c => c.name),
            x: candidates.map(c => c.votes),
            text: candidates.map(c => `${c.votes} votes (${c.percentage}%)`),
            textposition: 'outside',
            textfont: { size: 11, family: 'Inter' },
            marker: {
                color: candidates.map(c =>
                    positionData.winner && c.name === positionData.winner.name ? theme.colorway[0] : theme.colorway[3]
                ),
                opacity: 0.9
            },
            hovertemplate: '<b>%{y}</b><br>Votes: %{x}<br>%{text}<extra></extra>'
        };

        const layout = {
            ...theme,
            margin: { l: 20, r: 20, t: 10, b: 30 },
            xaxis: { ...theme.xaxis, title: 'Votes', automargin: true },
            yaxis: { ...theme.yaxis, automargin: true },
            hoverlabel: { bgcolor: '#1e293b', font: { color: '#f1f5f9', family: 'Inter' } },
            bargap: 0.3,
            height: Math.max(200, candidates.length * 60 + 60)
        };

        Plotly.newPlot(containerId, [trace], layout, Utils.plotlyConfig);
    },

    /**
     * Render a donut chart for a specific position
     */
    positionDonutChart(containerId, positionData) {
        const theme = Utils.getPlotlyTheme();
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        const trace = {
            type: 'pie',
            labels: positionData.candidates.map(c => c.name),
            values: positionData.candidates.map(c => c.votes),
            hole: 0.5,
            textinfo: 'label+percent',
            textposition: positionData.candidates.length > 1 ? 'outside' : 'inside',
            textfont: { size: 11, family: 'Inter', color: positionData.candidates.length > 1 ? theme.font.color : '#fff' },
            marker: {
                colors: positionData.candidates.map((c, i) => {
                    if (positionData.winner && c.name === positionData.winner.name) return theme.colorway[0];
                    return theme.colorway[(i % (theme.colorway.length - 1)) + 1];
                }),
                line: { color: isDark ? '#111827' : '#ffffff', width: 2 }
            },
            hovertemplate: '<b>%{label}</b><br>Votes: %{value}<br>Share: %{percent}<extra></extra>',
            rotation: -45
        };

        const layout = {
            ...theme,
            margin: { l: 10, r: 10, t: 10, b: 30 },
            showlegend: false,
            height: 280,
            annotations: [{
                text: `${positionData.totalVotes}<br>votes`,
                showarrow: false,
                font: { size: 14, family: 'Outfit', color: theme.font.color }
            }]
        };

        Plotly.newPlot(containerId, [trace], layout, Utils.plotlyConfig);
    }
};
