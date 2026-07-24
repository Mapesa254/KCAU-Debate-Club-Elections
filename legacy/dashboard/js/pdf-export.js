/**
 * pdf-export.js — Simple clone-based PDF export.
 * Clones the rendered position cards directly, strips charts,
 * mounts as a visible overlay so html2canvas can capture it.
 */
class PdfExporter {
    static async export() {
        const btn = document.getElementById('exportPdfBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="ph ph-spinner"></i> Generating PDF...';
        btn.disabled = true;

        // Full-screen white overlay — must be visible for html2canvas
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#fff;overflow-y:auto;';
        document.body.appendChild(overlay);

        try {
            const dateStr = new Date().toLocaleDateString('en-KE', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            // ── Header ──
            const header = document.createElement('div');
            header.style.cssText = 'text-align:center;padding:32px 40px 20px;border-bottom:3px solid #CBAE2D;margin-bottom:24px;';
            header.innerHTML = `
                <h1 style="font-size:22px;font-weight:800;color:#192c57;margin:0 0 6px 0;">KCAU Debate Club Elections 2026/27</h1>
                <p style="font-size:12px;color:#888;margin:0;">Official Results Report &middot; ${dateStr}</p>
            `;
            overlay.appendChild(header);

            // ── KPI Summary ──
            const kpiSource = document.getElementById('kpiGrid');
            if (kpiSource) {
                const kpiWrap = document.createElement('div');
                kpiWrap.style.cssText = 'padding:0 40px 24px;';
                kpiWrap.innerHTML = `<h2 style="font-size:15px;font-weight:700;color:#192c57;margin:0 0 12px 0;padding-bottom:6px;border-bottom:2px solid #CBAE2D;">Election Summary</h2>`;
                const kpiClone = kpiSource.cloneNode(true);
                // Force flex grid to wrap nicely
                kpiClone.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;';
                kpiClone.querySelectorAll('.kpi-card').forEach(c => {
                    c.style.cssText = 'flex:1;min-width:130px;border:1px solid #e0e0e0;border-radius:8px;padding:12px;background:#f8f9fa;box-shadow:none;';
                });
                kpiWrap.appendChild(kpiClone);
                overlay.appendChild(kpiWrap);
            }

            // ── Position Cards ──
            const posSource = document.getElementById('positionCards');
            if (posSource) {
                const posWrap = document.createElement('div');
                posWrap.style.cssText = 'padding:0 40px 40px;';
                posWrap.innerHTML = `
                    <div class="html2pdf__page-break"></div>
                    <h2 style="font-size:15px;font-weight:700;color:#192c57;margin:16px 0 12px 0;padding-bottom:6px;border-bottom:2px solid #CBAE2D;">Position-Level Results</h2>
                `;

                const posClone = posSource.cloneNode(true);

                // Remove all chart containers from clone
                posClone.querySelectorAll('.position-charts, .position-chart-container, .js-plotly-plot, .chart-card').forEach(el => el.remove());

                // Flatten styles on each card so they render inline
                posClone.querySelectorAll('.position-card').forEach(card => {
                    card.style.cssText = 'border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin-bottom:16px;background:#fff;page-break-inside:avoid;break-inside:avoid;box-shadow:none;';
                });

                // Reset progress bars to their final widths (not animated 0%)
                posClone.querySelectorAll('.progress-fill').forEach(fill => {
                    if (fill.dataset.width) fill.style.width = fill.dataset.width;
                });

                posWrap.appendChild(posClone);
                overlay.appendChild(posWrap);
            }

            // ── Generate PDF ──
            const opt = {
                margin:      0,
                filename:    'KCAU_Elections_Report.pdf',
                image:       { type: 'jpeg', quality: 0.95 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF:       { unit: 'in', format: 'letter', orientation: 'portrait' },
                pagebreak:   { mode: ['css', 'legacy'], before: '.html2pdf__page-break' }
            };

            await html2pdf().set(opt).from(overlay).save();

        } catch (err) {
            console.error('PDF Export Failed:', err);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            document.body.removeChild(overlay);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}
