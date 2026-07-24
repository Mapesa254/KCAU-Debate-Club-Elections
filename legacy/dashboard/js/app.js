/**
 * app.js — Main application controller
 * Handles initialization, theme toggling, sidebar, search, filters, 
 * auto-refresh, CSV export, and section rendering.
 */

(async function () {
    'use strict';

    // ─── Load Data ──────────────────────────────────────────────────
    let data;
    try {
        data = await ElectionData.load();
    } catch (err) {
        document.getElementById('kpiGrid').innerHTML =
            '<p style="color:var(--accent-6);padding:20px;">Failed to load election data. Run <code>node build-data.js</code> first.</p>';
        return;
    }

    // ─── Theme Setup ───────────────────────────────────────────────
    const savedTheme = localStorage.getItem('kcau-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);


    // ─── Sidebar Toggle (Mobile) ────────────────────────────────────
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    }

    menuToggle.addEventListener('click', openSidebar);
    sidebarClose.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    // ─── Scrollspy Navigation ───────────────────────────────────────
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeSidebar();
        });
    });

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('data-section') === id);
                });
            }
        });
    }, { rootMargin: '-20% 0px -70% 0px' });

    sections.forEach(section => scrollObserver.observe(section));



    // ─── PDF Export ─────────────────────────────────────────────────
    document.getElementById('exportPdfBtn').addEventListener('click', () => {
        if (typeof PdfExporter !== 'undefined') {
            PdfExporter.export();
        } else {
            alert('PDF Export script not loaded yet.');
        }
    });


    // ─── Render KPI Cards ───────────────────────────────────────────
    function renderKPIs() {
        const kpis = ElectionData.getKPIs();
        const grid = document.getElementById('kpiGrid');
        grid.innerHTML = kpis.map(kpi => `
            <div class="kpi-card">
                <span class="kpi-icon">${kpi.icon}</span>
                <div class="kpi-value" data-target="${kpi.value}" data-format="${kpi.format}">0</div>
                <div class="kpi-label">${kpi.label}</div>
                <div class="kpi-sub">${kpi.sub}</div>
            </div>
        `).join('');

        // Animate counters
        setTimeout(() => {
            grid.querySelectorAll('.kpi-value').forEach(el => {
                const target = parseFloat(el.dataset.target);
                const suffix = el.dataset.format === 'percent' ? '%' : '';
                Utils.animateCounter(el, target, 1500, suffix);
            });
        }, 200);
    }

    // ─── Render Position Cards ──────────────────────────────────────
    function renderPositionCards() {
        const positions = ElectionData.getPositionResults();
        const container = document.getElementById('positionCards');

        container.innerHTML = positions.map((pos, posIdx) => {
            const winner = pos.winner;
            const fillClasses = ['fill-1', 'fill-2', 'fill-3', 'fill-4', 'fill-5', 'fill-6'];

            return `
                <div class="position-card" data-position="${pos.position}" style="animation-delay: ${posIdx * 0.1}s">
                    <div class="position-header">
                        <h3 class="position-title">${pos.position}</h3>
                        <div class="position-badges">
                            <span class="badge badge-primary"><i class="ph ph-users"></i> ${pos.totalCandidates} Candidate${pos.totalCandidates !== 1 ? 's' : ''}</span>
                            <span class="badge badge-success"><i class="ph ph-check-square"></i> ${pos.totalVotes} Votes</span>
                            ${pos.isUncontested ? '<span class="badge badge-warning"><i class="ph ph-warning-circle"></i> Uncontested</span>' : ''}
                            ${pos.marginOfVictory > 0 && !pos.isUncontested ? `<span class="badge badge-primary"><i class="ph ph-arrows-left-right"></i> Margin: ${pos.marginOfVictory} votes</span>` : ''}
                        </div>
                    </div>

                    <div class="position-stats">
                        <div class="position-stat">
                            <div class="stat-label">Total Candidates</div>
                            <div class="stat-value">${pos.totalCandidates}</div>
                        </div>
                        <div class="position-stat">
                            <div class="stat-label">Total Votes</div>
                            <div class="stat-value">${pos.totalVotes}</div>
                        </div>
                        <div class="position-stat">
                            <div class="stat-label">Winner</div>
                            <div class="stat-value">${winner ? winner.name : '—'}</div>
                        </div>
                        ${pos.runnerUp ? `
                        <div class="position-stat">
                            <div class="stat-label">Runner-Up</div>
                            <div class="stat-value">${pos.runnerUp.name}</div>
                        </div>` : ''}
                        <div class="position-stat">
                            <div class="stat-label">Margin of Victory</div>
                            <div class="stat-value">${pos.marginOfVictory} votes (${pos.marginPercentage}%)</div>
                        </div>
                    </div>

                    ${winner ? `
                    <div class="winner-row">
                        <i class="ph ph-crown winner-crown"></i>
                        <div class="winner-info">
                            <div class="winner-name">${winner.name}</div>
                            <div class="winner-detail">${winner.votes} votes • ${winner.percentage}% of total${pos.isUncontested ? ' • Elected unopposed' : ''}</div>
                        </div>
                    </div>` : ''}

                    <div class="candidate-list">
                        ${pos.candidates.map((c, i) => {
                            const isWinner = winner && c.name === winner.name;
                            if (isWinner) return ''; // Already shown above
                            return `
                                <div class="candidate-row">
                                    <span class="candidate-rank">#${i + 1}</span>
                                    <span class="candidate-name">${c.name}</span>
                                    <span class="candidate-votes">${c.votes}</span>
                                    <span class="candidate-pct">${c.percentage}%</span>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <!-- Progress Bars -->
                    ${pos.candidates.map((c, i) => `
                        <div class="progress-bar-container">
                            <div class="progress-label">
                                <span class="name">${c.name} ${winner && c.name === winner.name ? '<i class="ph ph-crown"></i>' : ''}</span>
                                <span class="value">${c.votes} votes (${c.percentage}%)</span>
                            </div>
                            <div class="progress-track">
                                <div class="progress-fill ${fillClasses[i % fillClasses.length]}" style="width: 0%" data-width="${c.percentage}%"></div>
                            </div>
                        </div>
                    `).join('')}

                    <!-- Position Charts -->
                    <div class="position-charts">
                        <div class="position-chart-box">
                            <h4>Vote Ranking</h4>
                            <div class="position-chart-container" id="posChart_rank_${posIdx}"></div>
                        </div>
                        <div class="position-chart-box">
                            <h4>Vote Distribution</h4>
                            <div class="position-chart-container" id="posChart_donut_${posIdx}"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Animate progress bars
        setTimeout(() => {
            document.querySelectorAll('.progress-fill').forEach(fill => {
                fill.style.width = fill.dataset.width;
            });
        }, 300);
    }

    function renderPositionCharts() {
        const positions = ElectionData.getPositionResults();
        positions.forEach((pos, i) => {
            Charts.positionRankingChart(`posChart_rank_${i}`, pos);
            Charts.positionDonutChart(`posChart_donut_${i}`, pos);
        });
    }




    // ─── Auto-Refresh ───────────────────────────────────────────────
    const REFRESH_TIME = 1800; // 30 minutes in seconds
    let refreshCountdown = REFRESH_TIME;
    const refreshProgress = document.getElementById('refreshProgress');
    const refreshText = document.getElementById('refreshText');

    function updateRefreshUI() {
        refreshCountdown--;
        const pct = ((REFRESH_TIME - refreshCountdown) / REFRESH_TIME) * 100;
        refreshProgress.style.width = `${pct}%`;
        
        const minutes = Math.floor(refreshCountdown / 60);
        const seconds = refreshCountdown % 60;
        refreshText.textContent = `Auto-refresh in ${minutes}m ${seconds}s`;

        if (refreshCountdown <= 0) {
            refreshCountdown = REFRESH_TIME;
            refreshProgress.style.width = '0%';
            // Reload data
            location.reload();
        }
    }

    setInterval(updateRefreshUI, 1000);

    // ─── Footer Timestamp ───────────────────────────────────────────
    const footerTimestamp = document.getElementById('footerTimestamp');
    if (footerTimestamp) footerTimestamp.textContent = Utils.formatDate(data.meta.generatedAt);
    
    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated) lastUpdated.textContent = `Last updated: ${Utils.formatDate(data.meta.generatedAt)}`;

    // ─── Render Everything ──────────────────────────────────────────
    renderKPIs();
    Charts.renderAll(data);
    renderPositionCards();
    setTimeout(renderPositionCharts, 100);



})();
