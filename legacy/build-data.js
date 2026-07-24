/**
 * KCAU Debate Club Elections 2026/27
 * Data Build Script — Converts Excel files to processed JSON for the dashboard
 * 
 * Run: node build-data.js
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ─── File Paths ──────────────────────────────────────────────────────
const MEMBERS_FILE = path.join(__dirname, '..', 'KCAU DEBATE CLUB MEMBERS.xlsx');
const BALLOT_FILE = path.join(__dirname, '..', 'KCAU Debate Club Elections 2026_27 Ballot (Responses).xlsx');
const OUTPUT_DIR = path.join(__dirname, 'dashboard', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'election-data.json');

// ─── Helpers ─────────────────────────────────────────────────────────
const REG_PATTERN = /^\d{2}\/\d{4,5}$/;
const currentYear = 2026;

function deriveYearOfStudy(regNo) {
    const prefix = parseInt(regNo.split('/')[0], 10);
    const admissionYear = prefix <= 30 ? 2000 + prefix : 1900 + prefix;
    const year = currentYear - admissionYear + 1;
    return year >= 1 && year <= 7 ? `Year ${year}` : 'Unknown';
}

function cleanRegNo(reg) {
    return (reg || '').toString().trim().replace(/\s+/g, '');
}

// ─── Read Members ────────────────────────────────────────────────────
console.log('📂 Reading members file...');
const membersWb = XLSX.readFile(MEMBERS_FILE);
const membersSheet = membersWb.Sheets[membersWb.SheetNames[0]];
const membersRaw = XLSX.utils.sheet_to_json(membersSheet);

const membersMap = new Map();
const duplicateMembers = [];

membersRaw.forEach(row => {
    const regNo = cleanRegNo(row['REG NO']);
    const name = (row['MEMBERS'] || '').toString().trim();
    if (membersMap.has(regNo)) {
        duplicateMembers.push({ regNo, name, existing: membersMap.get(regNo).name });
    } else {
        membersMap.set(regNo, {
            regNo,
            name,
            yearOfStudy: deriveYearOfStudy(regNo),
            isValidRegNo: REG_PATTERN.test(regNo)
        });
    }
});

const members = Array.from(membersMap.values());
console.log(`  ✅ ${members.length} unique members loaded (${duplicateMembers.length} duplicates found)`);

// ─── Read Ballot Responses ──────────────────────────────────────────
console.log('📂 Reading ballot file...');
const ballotWb = XLSX.readFile(BALLOT_FILE);
const ballotSheet = ballotWb.Sheets[ballotWb.SheetNames[0]];
const ballotRaw = XLSX.utils.sheet_to_json(ballotSheet);

// Position column names from the ballot
const POSITIONS = [
    'PRESIDENT',
    'VICE PRESIDENT',
    'SECRETARY GENERAL',
    'ORGANISING SECRETARY',
    'PUBLICITY SECRETARY',
    'FINANCE SECRETARY'
];

// Process ballot entries
const ballots = [];
const duplicateVotes = [];
const voterRegNos = new Set();

ballotRaw.forEach((row, idx) => {
    const regNo = cleanRegNo(row['REGISTRATION NUMBER']);
    
    if (voterRegNos.has(regNo)) {
        duplicateVotes.push({ regNo, rowIndex: idx + 2 });
    } else {
        voterRegNos.add(regNo);
        const ballot = {
            timestamp: row['Timestamp'],
            regNo,
            isRegisteredMember: membersMap.has(regNo),
            isValidRegNo: REG_PATTERN.test(regNo),
            yearOfStudy: deriveYearOfStudy(regNo),
            votes: {}
        };
        POSITIONS.forEach(pos => {
            ballot.votes[pos] = (row[pos] || '').toString().trim();
        });
        ballots.push(ballot);
    }
});

console.log(`  ✅ ${ballots.length} valid ballots loaded (${duplicateVotes.length} duplicate votes found)`);

// ─── Compute Position-Level Results ──────────────────────────────────
console.log('📊 Computing results...');

const positionResults = POSITIONS.map(position => {
    const candidateVotes = {};
    
    ballots.forEach(ballot => {
        const candidate = ballot.votes[position];
        if (candidate) {
            candidateVotes[candidate] = (candidateVotes[candidate] || 0) + 1;
        }
    });
    
    const candidates = Object.entries(candidateVotes)
        .map(([name, votes]) => ({
            name,
            votes,
            percentage: ((votes / ballots.length) * 100).toFixed(1)
        }))
        .sort((a, b) => b.votes - a.votes);
    
    const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
    const winner = candidates[0] || null;
    const runnerUp = candidates[1] || null;
    const margin = winner && runnerUp ? winner.votes - runnerUp.votes : winner ? winner.votes : 0;
    const isUncontested = candidates.length === 1;
    
    return {
        position,
        candidates,
        totalVotes,
        totalCandidates: candidates.length,
        winner: winner ? {
            name: winner.name,
            votes: winner.votes,
            percentage: winner.percentage
        } : null,
        runnerUp: runnerUp ? {
            name: runnerUp.name,
            votes: runnerUp.votes,
            percentage: runnerUp.percentage
        } : null,
        marginOfVictory: margin,
        marginPercentage: totalVotes > 0 ? ((margin / totalVotes) * 100).toFixed(1) : '0',
        isUncontested
    };
});

// ─── Compute KPIs ────────────────────────────────────────────────────
const totalRegistered = members.length;
const totalVotesCast = ballots.length;
const registeredWhoVoted = ballots.filter(b => b.isRegisteredMember).length;
const nonMemberVotes = ballots.filter(b => !b.isRegisteredMember).length;
const totalValidVotes = ballots.filter(b => b.isValidRegNo).length;
const totalInvalidVotes = ballots.filter(b => !b.isValidRegNo).length;
const membersWhoDidNotVote = members.filter(m => !voterRegNos.has(m.regNo));
const voterTurnout = ((registeredWhoVoted / totalRegistered) * 100).toFixed(1);
const nonTurnout = (100 - parseFloat(voterTurnout)).toFixed(1);
const totalCandidates = new Set(positionResults.flatMap(p => p.candidates.map(c => c.name))).size;
const totalPositions = POSITIONS.length;
const winnersDeclared = positionResults.filter(p => p.winner).length;

// ─── Voter Participation by Year of Study ────────────────────────────
const yearOfStudyStats = {};

// Count registered members per year
members.forEach(m => {
    const yr = m.yearOfStudy;
    if (!yearOfStudyStats[yr]) yearOfStudyStats[yr] = { registered: 0, voted: 0 };
    yearOfStudyStats[yr].registered++;
});

// Count voters per year (including non-members for total participation view)
ballots.forEach(b => {
    const yr = b.yearOfStudy;
    if (!yearOfStudyStats[yr]) yearOfStudyStats[yr] = { registered: 0, voted: 0 };
    if (b.isRegisteredMember) {
        yearOfStudyStats[yr].voted++;
    }
});

const yearOfStudyData = Object.entries(yearOfStudyStats)
    .map(([year, data]) => ({
        year,
        registered: data.registered,
        voted: data.voted,
        turnoutPercent: data.registered > 0 ? ((data.voted / data.registered) * 100).toFixed(1) : '0'
    }))
    .sort((a, b) => a.year.localeCompare(b.year));

// ─── Data Quality Checks ────────────────────────────────────────────
const invalidRegNos = ballots
    .filter(b => !b.isValidRegNo)
    .map(b => ({ regNo: b.regNo, timestamp: b.timestamp }));

const nonMemberVoters = ballots
    .filter(b => !b.isRegisteredMember)
    .map(b => ({ regNo: b.regNo, timestamp: b.timestamp }));

const membersWithoutVotes = membersWhoDidNotVote.map(m => ({
    regNo: m.regNo,
    name: m.name
}));

const dataQuality = {
    totalRejectedVotes: totalInvalidVotes,
    summary: {
        invalidRegCount: invalidRegNos.length,
        duplicateVoteCount: duplicateVotes.length,
        duplicateMemberCount: duplicateMembers.length,
        missingVoteCount: membersWithoutVotes.length,
        nonMemberVoterCount: nonMemberVoters.length
    }
};

// ─── Generate Insights ──────────────────────────────────────────────
const contestedPositions = positionResults.filter(p => !p.isUncontested && p.candidates.length > 1);

const insights = {
    highestParticipationPosition: positionResults.reduce((a, b) => a.totalVotes >= b.totalVotes ? a : b).position,
    closestElection: contestedPositions.length > 0
        ? contestedPositions.reduce((a, b) => a.marginOfVictory <= b.marginOfVictory ? a : b)
        : null,
    highestVoteCandidate: positionResults.flatMap(p => p.candidates).reduce((a, b) => a.votes >= b.votes ? a : b),
    largestMargin: contestedPositions.length > 0
        ? contestedPositions.reduce((a, b) => a.marginOfVictory >= b.marginOfVictory ? a : b)
        : null,
    smallestMargin: contestedPositions.length > 0
        ? contestedPositions.reduce((a, b) => a.marginOfVictory <= b.marginOfVictory ? a : b)
        : null,
    nonVoterPercentage: nonTurnout,
    yearWithHighestTurnout: yearOfStudyData.filter(y => y.registered > 0).reduce((a, b) => parseFloat(a.turnoutPercent) >= parseFloat(b.turnoutPercent) ? a : b, { year: 'N/A', turnoutPercent: '0' }),
    yearWithLowestTurnout: yearOfStudyData.filter(y => y.registered > 0).reduce((a, b) => parseFloat(a.turnoutPercent) <= parseFloat(b.turnoutPercent) ? a : b, { year: 'N/A', turnoutPercent: '0' })
};

// ─── Assemble Final Output ──────────────────────────────────────────
const output = {
    meta: {
        generatedAt: new Date().toISOString(),
        electionTitle: 'KCAU Debate Club Elections 2026/27',
        membersFile: 'KCAU DEBATE CLUB MEMBERS.xlsx',
        ballotFile: 'KCAU Debate Club Elections 2026_27 Ballot (Responses).xlsx'
    },
    kpis: {
        totalRegistered,
        totalVotesCast,
        totalValidVotes,
        totalInvalidVotes,
        registeredWhoVoted,
        membersWhoDidNotVote: membersWhoDidNotVote.length,
        nonMemberVotes,
        voterTurnout: parseFloat(voterTurnout),
        nonTurnout: parseFloat(nonTurnout),
        totalCandidates,
        totalPositions,
        winnersDeclared
    },
    positionResults,
    yearOfStudyData,
    dataQuality,
    insights,
    // Raw lists for tables
    allCandidates: positionResults.flatMap(p => p.candidates.map(c => ({
        ...c,
        position: p.position,
        isWinner: p.winner && p.winner.name === c.name
    }))),
    nonVoterList: membersWithoutVotes
};

// ─── Write Output ───────────────────────────────────────────────────
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

console.log(`\n✅ Dashboard data written to ${OUTPUT_FILE}`);
console.log(`\n📊 Summary:`);
console.log(`   Registered Members: ${totalRegistered}`);
console.log(`   Votes Cast: ${totalVotesCast}`);
console.log(`   Voter Turnout: ${voterTurnout}%`);
console.log(`   Positions: ${totalPositions}`);
console.log(`   Unique Candidates: ${totalCandidates}`);
console.log(`   Winners Declared: ${winnersDeclared}`);
console.log(`   Data Quality Issues: ${dataQuality.summary.invalidRegCount} invalid reg, ${dataQuality.summary.duplicateVoteCount} dup votes, ${dataQuality.summary.duplicateMemberCount} dup members`);
