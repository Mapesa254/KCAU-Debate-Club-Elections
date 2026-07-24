/**
 * data.js — Data loading and analytics engine
 * Loads the pre-processed JSON and computes derived metrics for the dashboard.
 */

const ElectionData = {
    raw: null,

    /**
     * Load election data from the pre-built JSON file
     */
    async load() {
        try {
            const cacheBuster = Date.now();
            const response = await fetch(`data/election-data.json?t=${cacheBuster}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.raw = await response.json();
            return this.raw;
        } catch (err) {
            console.error('Failed to load election data:', err);
            throw err;
        }
    },

    /**
     * Get KPI data array for rendering cards
     */
    getKPIs() {
        const k = this.raw.kpis;
        return [
            {
                icon: '<i class="ph ph-users-three"></i>',
                value: k.totalRegistered,
                label: 'Registered Members',
                sub: `Unique club members`,
                format: 'number'
            },
            {
                icon: '<i class="ph ph-files"></i>',
                value: k.totalVotesCast,
                label: 'Total Votes Cast',
                sub: `${k.registeredWhoVoted} from members, ${k.nonMemberVotes} non-members`,
                format: 'number'
            },
            {
                icon: '<i class="ph ph-check-circle"></i>',
                value: k.totalValidVotes,
                label: 'Valid Votes',
                sub: `${Utils.formatPercent((k.totalValidVotes / k.totalVotesCast) * 100)} of total`,
                format: 'number'
            },
            {
                icon: '<i class="ph ph-x-circle"></i>',
                value: k.totalInvalidVotes,
                label: 'Invalid Votes',
                sub: k.totalInvalidVotes === 0 ? 'No invalid ballots detected' : `${Utils.formatPercent((k.totalInvalidVotes / k.totalVotesCast) * 100)} of total`,
                format: 'number'
            },
            {
                icon: '<i class="ph ph-user-minus"></i>',
                value: k.membersWhoDidNotVote,
                label: 'Did Not Vote',
                sub: `Out of ${k.totalRegistered} registered members`,
                format: 'number'
            },
            {
                icon: '<i class="ph ph-chart-line-up"></i>',
                value: k.voterTurnout,
                label: 'Voter Turnout',
                sub: `${k.registeredWhoVoted} of ${k.totalRegistered} members voted`,
                format: 'percent'
            },
            {
                icon: '<i class="ph ph-chart-line-down"></i>',
                value: k.nonTurnout,
                label: 'Non-Turnout',
                sub: `${k.membersWhoDidNotVote} members absent`,
                format: 'percent'
            },
            {
                icon: '<i class="ph ph-user-list"></i>',
                value: k.totalCandidates,
                label: 'Total Candidates',
                sub: `Across all ${k.totalPositions} positions`,
                format: 'number'
            },
            {
                icon: '<i class="ph ph-chair"></i>',
                value: k.totalPositions,
                label: 'Total Positions',
                sub: `${this.raw.positionResults.filter(p => p.isUncontested).length} uncontested`,
                format: 'number'
            },
            {
                icon: '<i class="ph ph-crown"></i>',
                value: k.winnersDeclared,
                label: 'Winners Declared',
                sub: 'All positions filled',
                format: 'number'
            }
        ];
    },

    /**
     * Get all candidates flat list for charts
     */
    getAllCandidates() {
        return this.raw.allCandidates || [];
    },

    /**
     * Get position results
     */
    getPositionResults() {
        return this.raw.positionResults || [];
    },

    /**
     * Get year of study data
     */
    getYearOfStudyData() {
        return this.raw.yearOfStudyData || [];
    },

    /**
     * Get data quality info
     */
    getDataQuality() {
        return this.raw.dataQuality || {};
    },

    /**
     * Get insights
     */
    getInsights() {
        return this.raw.insights || {};
    },

    /**
     * Get CSV-exportable candidate data
     */
    getCandidateExportData() {
        return this.raw.allCandidates.map(c => ({
            Position: c.position,
            Candidate: c.name,
            Votes: c.votes,
            'Vote %': c.percentage + '%',
            Winner: c.isWinner ? 'Yes' : 'No'
        }));
    },

    /**
     * Filter candidates by position
     */
    filterByPosition(position) {
        if (position === 'all') return this.raw.allCandidates;
        return this.raw.allCandidates.filter(c => c.position === position);
    },

    /**
     * Search candidates by name
     */
    searchCandidates(query) {
        if (!query) return this.raw.allCandidates;
        const q = query.toLowerCase();
        return this.raw.allCandidates.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.position.toLowerCase().includes(q)
        );
    }
};
