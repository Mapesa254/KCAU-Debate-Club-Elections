"""
charts.py — All Plotly interactive chart renderings.
Faithfully ported from legacy/dashboard/js/charts.js
Each function mirrors the exact chart from the original JavaScript.
"""

import plotly.graph_objects as go

COLORWAY = ['#CBAE2D', '#B59821', '#E5C949', '#383838', '#8C7311', '#192c57', '#CBAE2D', '#383838', '#10b981', '#f59e0b']


def _layout_base(font_color, gridcolor, zerolinecolor, hovbg, hovfg):
    """Common layout base matching Utils.getPlotlyTheme()"""
    return {
        'paper_bgcolor': 'rgba(0,0,0,0)',
        'plot_bgcolor':  'rgba(0,0,0,0)',
        'font': {'family': 'Inter, sans-serif', 'color': font_color, 'size': 12},
        'xaxis': {'gridcolor': gridcolor, 'zerolinecolor': zerolinecolor},
        'yaxis': {'gridcolor': gridcolor, 'zerolinecolor': zerolinecolor},
        'hoverlabel': {'bgcolor': hovbg, 'font': {'color': hovfg, 'family': 'Inter, sans-serif'}},
    }


# ─── 1. Overall Vote Share ─────────────────────────────────────────────
def overall_vote_share(data, is_dark, font_color, gridcolor, zerolinecolor, hovbg, hovfg, pie_line):
    """Donut chart — contested positions only. Mirrors Charts.overallVoteShare()"""
    candidates = [
        c for c in data['allCandidates']
        if not next((p for p in data['positionResults'] if p['position'] == c['position']), {}).get('isUncontested', True)
    ]

    fig = go.Figure(data=[go.Pie(
        labels=[c['name'] for c in candidates],
        values=[c['votes'] for c in candidates],
        hole=0.55,
        textinfo='label+percent',
        textposition='outside',
        textfont={'size': 11, 'family': 'Inter, sans-serif'},
        marker={
            'colors': COLORWAY,
            'line': {'color': pie_line, 'width': 2}
        },
        hovertemplate='<b>%{label}</b><br>Votes: %{value}<br>Share: %{percent}<extra></extra>',
        pull=[0.05 if i == 0 else 0 for i in range(len(candidates))],
        rotation=-30
    )])

    layout = _layout_base(font_color, gridcolor, zerolinecolor, hovbg, hovfg)
    layout.update({
        'margin': {'l': 20, 'r': 20, 't': 20, 'b': 20},
        'showlegend': True,
        'legend': {
            'orientation': 'h', 'y': -0.15, 'x': 0.5, 'xanchor': 'center',
            'font': {'size': 10, 'family': 'Inter, sans-serif', 'color': font_color}
        },
        'annotations': [{'text': 'Contested<br>Positions', 'showarrow': False,
                          'font': {'size': 13, 'family': 'Outfit, sans-serif', 'color': font_color},
                          'x': 0.5, 'y': 0.5}]
    })
    fig.update_layout(layout)
    return fig


# ─── 2. Turnout Pie ────────────────────────────────────────────────────
def turnout_pie(data, is_dark, font_color, gridcolor, zerolinecolor, hovbg, hovfg, pie_line):
    """Pie chart — voted vs did not vote. Mirrors Charts.turnoutPie()"""
    k = data['kpis']

    fig = go.Figure(data=[go.Pie(
        labels=['Voted', 'Did Not Vote'],
        values=[k['registeredWhoVoted'], k['membersWhoDidNotVote']],
        textinfo='label+value+percent',
        textposition='inside',
        textfont={'size': 13, 'family': 'Inter, sans-serif', 'color': '#ffffff'},
        marker={
            'colors': [COLORWAY[0], COLORWAY[3]],
            'line': {'color': pie_line, 'width': 2}
        },
        hovertemplate='<b>%{label}</b><br>Count: %{value}<br>%{percent}<extra></extra>',
        pull=[0.03, 0.03]
    )])

    layout = _layout_base(font_color, gridcolor, zerolinecolor, hovbg, hovfg)
    layout.update({
        'margin': {'l': 20, 'r': 20, 't': 20, 'b': 40},
        'showlegend': True,
        'legend': {
            'orientation': 'h', 'y': -0.1, 'x': 0.5, 'xanchor': 'center',
            'font': {'size': 11, 'family': 'Inter, sans-serif', 'color': font_color}
        }
    })
    fig.update_layout(layout)
    return fig


# ─── 3. Votes by Position ─────────────────────────────────────────────
def votes_by_position(data, is_dark, font_color, gridcolor, zerolinecolor, hovbg, hovfg):
    """Vertical bar — votes per position. Mirrors Charts.votesByPosition()"""
    pos_results = data['positionResults']

    fig = go.Figure(data=[go.Bar(
        x=[p['position'] for p in pos_results],
        y=[p['totalVotes'] for p in pos_results],
        text=[p['totalVotes'] for p in pos_results],
        textposition='outside',
        textfont={'size': 12, 'family': 'Outfit, sans-serif'},
        marker={'color': COLORWAY[0], 'opacity': 0.9, 'line': {'width': 0}},
        hovertemplate='<b>%{x}</b><br>Total Votes: %{y}<br>Candidates: %{customdata}<extra></extra>',
        customdata=[p['totalCandidates'] for p in pos_results]
    )])

    layout = _layout_base(font_color, gridcolor, zerolinecolor, hovbg, hovfg)
    layout.update({
        'margin': {'l': 20, 'r': 20, 't': 20, 'b': 40},
        'xaxis': {'tickangle': -25, 'automargin': True, 'gridcolor': gridcolor, 'zerolinecolor': zerolinecolor},
        'yaxis': {'title': 'Total Votes', 'automargin': True, 'gridcolor': gridcolor, 'zerolinecolor': zerolinecolor},
        'bargap': 0.35
    })
    fig.update_layout(layout)
    return fig


# ─── 4. Registered vs Cast ────────────────────────────────────────────
def registered_vs_cast(data, is_dark, font_color, gridcolor, zerolinecolor, hovbg, hovfg):
    """Bar chart — registered / cast / member voters. Mirrors Charts.registeredVsCast()"""
    k = data['kpis']

    fig = go.Figure(data=[go.Bar(
        x=['Registered Members', 'Votes Cast', 'Members Who Voted'],
        y=[k['totalRegistered'], k['totalVotesCast'], k['registeredWhoVoted']],
        text=[k['totalRegistered'], k['totalVotesCast'], k['registeredWhoVoted']],
        textposition='outside',
        textfont={'size': 14, 'family': 'Outfit, sans-serif'},
        marker={'color': [COLORWAY[3], COLORWAY[2], COLORWAY[0]], 'opacity': 0.9},
        hovertemplate='<b>%{x}</b><br>Count: %{y}<extra></extra>'
    )])

    layout = _layout_base(font_color, gridcolor, zerolinecolor, hovbg, hovfg)
    layout.update({
        'margin': {'l': 20, 'r': 20, 't': 20, 'b': 40},
        'xaxis': {'automargin': True, 'gridcolor': gridcolor, 'zerolinecolor': zerolinecolor},
        'yaxis': {'title': 'Count', 'automargin': True, 'gridcolor': gridcolor, 'zerolinecolor': zerolinecolor},
        'bargap': 0.4
    })
    fig.update_layout(layout)
    return fig


# ─── 5. Valid vs Invalid ──────────────────────────────────────────────
def valid_vs_invalid(data, is_dark, font_color, gridcolor, zerolinecolor, hovbg, hovfg):
    """Bar chart — valid vs invalid votes. Mirrors Charts.validVsInvalid()"""
    k = data['kpis']
    y_max = max(k['totalValidVotes'], k['totalInvalidVotes'], 1) * 1.2

    fig = go.Figure(data=[go.Bar(
        x=['Valid Votes', 'Invalid Votes'],
        y=[k['totalValidVotes'], k['totalInvalidVotes']],
        text=[k['totalValidVotes'], k['totalInvalidVotes']],
        textposition='outside',
        textfont={'size': 14, 'family': 'Outfit, sans-serif'},
        marker={'color': [COLORWAY[0], COLORWAY[3]], 'opacity': 0.9},
        width=[0.4, 0.4],
        hovertemplate='<b>%{x}</b><br>Count: %{y}<extra></extra>'
    )])

    layout = _layout_base(font_color, gridcolor, zerolinecolor, hovbg, hovfg)
    layout.update({
        'margin': {'l': 20, 'r': 20, 't': 20, 'b': 40},
        'xaxis': {'automargin': True, 'gridcolor': gridcolor, 'zerolinecolor': zerolinecolor},
        'yaxis': {'title': 'Count', 'range': [0, y_max], 'automargin': True, 'gridcolor': gridcolor, 'zerolinecolor': zerolinecolor},
        'bargap': 0.5
    })
    fig.update_layout(layout)
    return fig


# ─── 6. Top Performing Positions by Turnout ───────────────────────────
def top_positions_turnout(data, is_dark, font_color, gridcolor, zerolinecolor, hovbg, hovfg):
    """Horizontal bar — positions sorted by total votes. Mirrors Charts.topPositionsByTurnout()"""
    sorted_pos = sorted(data['positionResults'], key=lambda p: p['totalVotes'], reverse=True)

    fig = go.Figure(data=[go.Bar(
        type='bar',
        orientation='h',
        y=[p['position'] for p in sorted_pos],
        x=[p['totalVotes'] for p in sorted_pos],
        text=[f"{p['totalVotes']} votes" for p in sorted_pos],
        textposition='outside',
        textfont={'size': 11, 'family': 'Inter, sans-serif'},
        marker={'color': COLORWAY[0], 'opacity': 0.9},
        hovertemplate='<b>%{y}</b><br>Total Votes: %{x}<extra></extra>'
    )])

    layout = _layout_base(font_color, gridcolor, zerolinecolor, hovbg, hovfg)
    layout.update({
        'margin': {'l': 20, 'r': 20, 't': 20, 'b': 40},
        'xaxis': {'title': 'Total Votes', 'automargin': True, 'gridcolor': gridcolor, 'zerolinecolor': zerolinecolor},
        'yaxis': {'automargin': True, 'gridcolor': gridcolor, 'zerolinecolor': zerolinecolor},
        'bargap': 0.35
    })
    fig.update_layout(layout)
    return fig


# ─── 7. Candidate Overall Ranking ─────────────────────────────────────
def candidate_ranking(data, is_dark, font_color, gridcolor, zerolinecolor, hovbg, hovfg):
    """Bar chart — all candidates sorted by votes. Mirrors Charts.candidateRanking()"""
    candidates = sorted(data['allCandidates'], key=lambda c: c['votes'], reverse=True)
    colors = [COLORWAY[0] if c.get('isWinner') else COLORWAY[3] for c in candidates]

    fig = go.Figure(data=[go.Bar(
        x=[c['name'] for c in candidates],
        y=[c['votes'] for c in candidates],
        text=[f"{c['votes']} ({c['percentage']}%)" for c in candidates],
        textposition='outside',
        textfont={'size': 11, 'family': 'Inter, sans-serif'},
        marker={'color': colors, 'opacity': 0.9, 'line': {'width': 0}},
        hovertemplate='<b>%{x}</b><br>Position: %{customdata}<br>Votes: %{y}<extra></extra>',
        customdata=[c['position'] for c in candidates]
    )])

    layout = _layout_base(font_color, gridcolor, zerolinecolor, hovbg, hovfg)
    layout.update({
        'margin': {'l': 20, 'r': 20, 't': 20, 'b': 60},
        'xaxis': {'tickangle': -30, 'automargin': True, 'gridcolor': gridcolor, 'zerolinecolor': zerolinecolor},
        'yaxis': {'title': 'Votes', 'automargin': True, 'gridcolor': gridcolor, 'zerolinecolor': zerolinecolor},
        'bargap': 0.3
    })
    fig.update_layout(layout)
    return fig


# ─── 8. Position Ranking Chart (per position) ─────────────────────────
def position_ranking_chart(pos_data, is_dark, font_color, gridcolor, zerolinecolor, hovbg, hovfg):
    """Horizontal bar per position — mirrors Charts.positionRankingChart()"""
    winner = pos_data['winner']
    candidates = sorted(pos_data['candidates'], key=lambda c: c['votes'])
    colors = [COLORWAY[0] if winner and c['name'] == winner['name'] else COLORWAY[3] for c in candidates]

    fig = go.Figure(data=[go.Bar(
        orientation='h',
        y=[c['name'] for c in candidates],
        x=[c['votes'] for c in candidates],
        text=[f"{c['votes']} votes ({c['percentage']}%)" for c in candidates],
        textposition='outside',
        textfont={'size': 11, 'family': 'Inter, sans-serif'},
        marker={'color': colors, 'opacity': 0.9},
        hovertemplate='<b>%{y}</b><br>Votes: %{x}<br>%{text}<extra></extra>'
    )])

    height = max(200, len(candidates) * 60 + 60)
    layout = _layout_base(font_color, gridcolor, zerolinecolor, hovbg, hovfg)
    layout.update({
        'margin': {'l': 20, 'r': 20, 't': 10, 'b': 30},
        'xaxis': {'title': 'Votes', 'automargin': True, 'gridcolor': gridcolor, 'zerolinecolor': zerolinecolor},
        'yaxis': {'automargin': True, 'gridcolor': gridcolor, 'zerolinecolor': zerolinecolor},
        'bargap': 0.3,
        'height': height
    })
    fig.update_layout(layout)
    return fig


# ─── 9. Position Donut Chart ──────────────────────────────────────────
def position_donut_chart(pos_data, is_dark, font_color, pie_line):
    """Donut per position — mirrors Charts.positionDonutChart()"""
    winner = pos_data['winner']
    candidates = pos_data['candidates']

    colors = []
    for i, c in enumerate(candidates):
        if winner and c['name'] == winner['name']:
            colors.append(COLORWAY[0])
        else:
            colors.append(COLORWAY[(i % (len(COLORWAY) - 1)) + 1])

    textpos = 'outside' if len(candidates) > 1 else 'inside'
    text_color_list = [font_color] * len(candidates) if len(candidates) > 1 else ['#ffffff'] * len(candidates)

    fig = go.Figure(data=[go.Pie(
        labels=[c['name'] for c in candidates],
        values=[c['votes'] for c in candidates],
        hole=0.5,
        textinfo='label+percent',
        textposition=textpos,
        textfont={'size': 11, 'family': 'Inter, sans-serif', 'color': font_color},
        marker={'colors': colors, 'line': {'color': pie_line, 'width': 2}},
        hovertemplate='<b>%{label}</b><br>Votes: %{value}<br>Share: %{percent}<extra></extra>',
        rotation=-45
    )])

    fig.update_layout(
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        showlegend=False,
        height=280,
        margin={'l': 10, 'r': 10, 't': 10, 'b': 30},
        annotations=[{
            'text': f"{pos_data['totalVotes']}<br>votes",
            'showarrow': False,
            'font': {'size': 14, 'family': 'Outfit, sans-serif', 'color': font_color}
        }]
    )
    return fig
