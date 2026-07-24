/**
 * insights.js — Auto-generates readable insight cards from election data
 */

const Insights = {
    /**
     * Generate all insight cards and render them into the DOM
     */
    render(data) {
        const insights = data.insights;
        const kpis = data.kpis;
        const positions = data.positionResults;
        const grid = document.getElementById('insightsGrid');
        if (!grid) return;

        const cards = [];

        // 1. Highest voter participation position
        cards.push({
            icon: '<i class="ph ph-trophy"></i>',
            title: 'Highest Voter Participation',
            text: `<span class="insight-highlight">${insights.highestParticipationPosition}</span> had the highest voter participation with all <span class="insight-highlight">${data.kpis.totalVotesCast}</span> ballots cast for this position.`
        });

        // 2. Closest election
        if (insights.closestElection) {
            cards.push({
                icon: '<i class="ph ph-scales"></i>',
                title: 'Closest Election',
                text: `The <span class="insight-highlight">${insights.closestElection.position}</span> race was the closest with a margin of just <span class="insight-highlight">${insights.closestElection.marginOfVictory} vote${insights.closestElection.marginOfVictory !== 1 ? 's' : ''}</span> (${insights.closestElection.marginPercentage}%).`
            });
        }

        // 3. Highest vote candidate
        if (insights.highestVoteCandidate) {
            cards.push({
                icon: '<i class="ph ph-star"></i>',
                title: 'Most Votes Received',
                text: `<span class="insight-highlight">${insights.highestVoteCandidate.name}</span> received the highest number of votes across all positions with <span class="insight-highlight">${insights.highestVoteCandidate.votes} votes</span> (${insights.highestVoteCandidate.percentage}%).`
            });
        }

        // 4. Largest winning margin
        if (insights.largestMargin) {
            cards.push({
                icon: '<i class="ph ph-arrows-out-line-horizontal"></i>',
                title: 'Largest Winning Margin',
                text: `The <span class="insight-highlight">${insights.largestMargin.position}</span> position had the largest winning margin of <span class="insight-highlight">${insights.largestMargin.marginOfVictory} votes</span> (${insights.largestMargin.marginPercentage}%).`
            });
        }

        // 5. Smallest winning margin
        if (insights.smallestMargin && insights.smallestMargin.position !== (insights.largestMargin && insights.largestMargin.position)) {
            cards.push({
                icon: '<i class="ph ph-arrows-in-line-horizontal"></i>',
                title: 'Smallest Winning Margin',
                text: `The <span class="insight-highlight">${insights.smallestMargin.position}</span> position had the tightest race with a margin of just <span class="insight-highlight">${insights.smallestMargin.marginOfVictory} votes</span> (${insights.smallestMargin.marginPercentage}%).`
            });
        }

        // 6. Non-voter percentage
        cards.push({
            icon: '<i class="ph ph-trend-down"></i>',
            title: 'Members Who Did Not Vote',
            text: `<span class="insight-highlight">${insights.nonVoterPercentage}%</span> of registered members (<span class="insight-highlight">${kpis.membersWhoDidNotVote}</span> out of ${kpis.totalRegistered}) did not cast their vote in this election.`
        });

        // 7. Year with highest turnout
        if (insights.yearWithHighestTurnout && insights.yearWithHighestTurnout.year !== 'N/A') {
            cards.push({
                icon: '<i class="ph ph-graduation-cap"></i>',
                title: 'Highest Turnout by Year of Study',
                text: `<span class="insight-highlight">${insights.yearWithHighestTurnout.year}</span> students had the highest turnout at <span class="insight-highlight">${insights.yearWithHighestTurnout.turnoutPercent}%</span>.`
            });
        }

        // 8. Year with lowest turnout
        if (insights.yearWithLowestTurnout && insights.yearWithLowestTurnout.year !== 'N/A' &&
            insights.yearWithLowestTurnout.year !== insights.yearWithHighestTurnout.year) {
            cards.push({
                icon: '<i class="ph ph-chart-bar"></i>',
                title: 'Lowest Turnout by Year of Study',
                text: `<span class="insight-highlight">${insights.yearWithLowestTurnout.year}</span> students had the lowest turnout at <span class="insight-highlight">${insights.yearWithLowestTurnout.turnoutPercent}%</span>.`
            });
        }

        // 9. Uncontested positions
        const uncontested = positions.filter(p => p.isUncontested);
        if (uncontested.length > 0) {
            cards.push({
                icon: '<i class="ph ph-medal"></i>',
                title: 'Uncontested Positions',
                text: `<span class="insight-highlight">${uncontested.length}</span> out of ${positions.length} positions were uncontested: <span class="insight-highlight">${uncontested.map(p => p.position).join(', ')}</span>.`
            });
        }

        // 10. Non-member voters
        if (kpis.nonMemberVotes > 0) {
            cards.push({
                icon: '<i class="ph ph-magnifying-glass"></i>',
                title: 'Non-Member Voters',
                text: `<span class="insight-highlight">${kpis.nonMemberVotes}</span> ballot${kpis.nonMemberVotes !== 1 ? 's' : ''} were cast by registration numbers not found in the official member list. These may be new or unregistered members.`
            });
        }

        // 11. Overall election summary
        cards.push({
            icon: '<i class="ph ph-clipboard-text"></i>',
            title: 'Election Overview',
            text: `A total of <span class="insight-highlight">${kpis.totalVotesCast}</span> votes were cast across <span class="insight-highlight">${kpis.totalPositions}</span> positions featuring <span class="insight-highlight">${kpis.totalCandidates}</span> candidates. The overall registered-member turnout was <span class="insight-highlight">${kpis.voterTurnout}%</span>.`
        });

        // 12. Winners overview
        const winners = positions.filter(p => p.winner).map(p => `${p.winner.name} (${p.position})`);
        if (winners.length > 0) {
            cards.push({
                icon: '<i class="ph ph-crown"></i>',
                title: 'Elected Officials',
                text: `The following candidates were declared winners: <span class="insight-highlight">${winners.join(', ')}</span>.`
            });
        }

        // Render cards
        grid.innerHTML = cards.map(card => `
            <div class="insight-card">
                <div class="insight-icon">${card.icon}</div>
                <div class="insight-content">
                    <div class="insight-title">${card.title}</div>
                    <div class="insight-text">${card.text}</div>
                </div>
            </div>
        `).join('');
    }
};
