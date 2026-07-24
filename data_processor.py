import pandas as pd
import re

MEMBERS_FILE = 'KCAU DEBATE CLUB MEMBERS.xlsx'
BALLOT_FILE = 'KCAU Debate Club Elections 2026_27 Ballot (Responses).xlsx'

POSITIONS = [
    'PRESIDENT',
    'VICE PRESIDENT',
    'SECRETARY GENERAL',
    'ORGANISING SECRETARY',
    'PUBLICITY SECRETARY',
    'FINANCE SECRETARY'
]

def load_data():
    # 1. Read members
    members_df = pd.read_excel(MEMBERS_FILE)
    members_df['REG NO'] = members_df['REG NO'].astype(str).str.strip().str.replace(r'\s+', '', regex=True)
    
    # drop duplicate members by keeping first
    members_df = members_df.drop_duplicates(subset=['REG NO'], keep='first')
    valid_members = set(members_df['REG NO'].tolist())
    total_registered = len(valid_members)
    
    # 2. Read ballots
    ballot_df = pd.read_excel(BALLOT_FILE)
    ballot_df['REGISTRATION NUMBER'] = ballot_df['REGISTRATION NUMBER'].astype(str).str.strip().str.replace(r'\s+', '', regex=True)
    
    # drop duplicate votes
    ballot_df = ballot_df.drop_duplicates(subset=['REGISTRATION NUMBER'], keep='first')
    
    # valid reg pattern: YY/NNNNN
    def is_valid_reg(reg):
        return bool(re.match(r'^\d{2}/\d{4,5}$', reg))
        
    ballot_df['is_valid_reg'] = ballot_df['REGISTRATION NUMBER'].apply(is_valid_reg)
    ballot_df['is_registered'] = ballot_df['REGISTRATION NUMBER'].isin(valid_members)
    
    total_votes_cast = len(ballot_df)
    total_valid_votes = int(ballot_df['is_valid_reg'].sum())
    total_invalid_votes = total_votes_cast - total_valid_votes
    registered_who_voted = int(ballot_df['is_registered'].sum())
    non_member_votes = total_votes_cast - registered_who_voted
    members_who_did_not_vote = total_registered - registered_who_voted
    voter_turnout = round((registered_who_voted / total_registered * 100), 1) if total_registered > 0 else 0.0
    non_turnout = round(100.0 - voter_turnout, 1)
    
    # 3. Compute Position Results
    position_results = []
    all_candidates = []
    
    for pos in POSITIONS:
        if pos not in ballot_df.columns:
            continue
            
        votes = ballot_df[pos].dropna().astype(str).str.strip()
        votes = votes[votes != 'nan']
        votes = votes[votes != '']
        
        counts = votes.value_counts()
        total_pos_votes = int(counts.sum())
        
        candidates = []
        for name, cnt in counts.items():
            candidates.append({
                'name': name,
                'votes': int(cnt),
                'percentage': round((cnt / total_pos_votes * 100), 1) if total_pos_votes > 0 else 0.0
            })
            
        is_uncontested = len(candidates) == 1
        winner = candidates[0] if len(candidates) > 0 else None
        runner_up = candidates[1] if len(candidates) > 1 else None
        margin = (winner['votes'] - runner_up['votes']) if (winner and runner_up) else (winner['votes'] if winner else 0)
        margin_percentage = round((margin / total_pos_votes * 100), 1) if total_pos_votes > 0 else 0.0
        
        pos_data = {
            'position': pos,
            'candidates': candidates,
            'totalVotes': total_pos_votes,
            'totalCandidates': len(candidates),
            'winner': winner,
            'runnerUp': runner_up,
            'marginOfVictory': margin,
            'marginPercentage': margin_percentage,
            'isUncontested': is_uncontested
        }
        position_results.append(pos_data)
        
        for c in candidates:
            c_copy = c.copy()
            c_copy['position'] = pos
            c_copy['isWinner'] = (winner and winner['name'] == c['name'])
            all_candidates.append(c_copy)
            
    total_candidates = len(set(c['name'] for c in all_candidates))
    total_positions = len(POSITIONS)
    winners_declared = sum(1 for p in position_results if p['winner'])
    
    kpis = {
        'totalRegistered': total_registered,
        'totalVotesCast': total_votes_cast,
        'totalValidVotes': total_valid_votes,
        'totalInvalidVotes': total_invalid_votes,
        'registeredWhoVoted': registered_who_voted,
        'membersWhoDidNotVote': members_who_did_not_vote,
        'nonMemberVotes': non_member_votes,
        'voterTurnout': voter_turnout,
        'nonTurnout': non_turnout,
        'totalCandidates': total_candidates,
        'totalPositions': total_positions,
        'winnersDeclared': winners_declared
    }
    
    return {
        'kpis': kpis,
        'positionResults': position_results,
        'allCandidates': all_candidates
    }
