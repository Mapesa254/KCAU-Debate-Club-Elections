/**
 * utils.js — Helper utilities for the KCAU Elections Dashboard
 */

const Utils = {
    /**
     * Format a number with commas (e.g., 1,234)
     */
    formatNumber(num) {
        if (num == null) return '—';
        return num.toLocaleString('en-US');
    },

    /**
     * Format as percentage string
     */
    formatPercent(value, decimals = 1) {
        if (value == null) return '—';
        return `${parseFloat(value).toFixed(decimals)}%`;
    },

    /**
     * Animate a counter from 0 to target
     */
    animateCounter(element, target, duration = 1200, suffix = '') {
        const start = 0;
        const isFloat = String(target).includes('.');
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + (target - start) * eased;

            if (isFloat) {
                element.textContent = current.toFixed(1) + suffix;
            } else {
                element.textContent = Math.round(current).toLocaleString('en-US') + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    },

    /**
     * Convert data array to CSV and trigger download
     */
    exportToCSV(data, filename = 'export.csv') {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row =>
                headers.map(h => {
                    let val = row[h] ?? '';
                    val = String(val).replace(/"/g, '""');
                    return `"${val}"`;
                }).join(',')
            )
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Format a timestamp string to readable date
     */
    formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    },

    /**
     * Get Plotly theme config based on current theme
     */
    getPlotlyTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
                family: 'Inter, sans-serif',
                color: isDark ? '#94a3b8' : '#475569',
                size: 12
            },
            title: {
                font: {
                    family: 'Outfit, sans-serif',
                    color: isDark ? '#f1f5f9' : '#0f172a',
                    size: 16
                }
            },
            colorway: [
                '#CBAE2D', '#B59821', '#E5C949', '#383838',
                '#8C7311', '#192c57', '#CBAE2D', '#383838',
                '#10b981', '#f59e0b'
            ],
            gridcolor: isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(15, 23, 42, 0.06)',
            xaxis: {
                gridcolor: isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(15, 23, 42, 0.06)',
                zerolinecolor: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(15, 23, 42, 0.1)',
            },
            yaxis: {
                gridcolor: isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(15, 23, 42, 0.06)',
                zerolinecolor: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(15, 23, 42, 0.1)',
            }
        };
    },

    /**
     * Common Plotly config
     */
    plotlyConfig: {
        responsive: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
        toImageButtonOptions: {
            format: 'png',
            filename: 'kcau-election-chart',
            scale: 2
        }
    },

    /**
     * Gradient color palette
     */
    gradientColors: [
        ['#CBAE2D', '#B59821'],
        ['#B59821', '#8C7311'],
        ['#CBAE2D', '#383838'],
        ['#8C7311', '#CBAE2D'],
        ['#383838', '#CBAE2D'],
        ['#E5C949', '#CBAE2D'],
    ]
};
