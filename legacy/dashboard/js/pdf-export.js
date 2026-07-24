class PdfExporter {
    static async export() {
        const btn = document.getElementById('exportPdfBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Generating PDF...';
        btn.disabled = true;

        // Keep track of inserted page break elements for cleanup
        const insertedBreaks = [];

        try {
            // 1. Enable PDF export mode on body (hides sidebar/buttons, flattens grid layouts)
            document.body.classList.add('pdf-export-mode');

            // 2. Insert explicit page break markers before major sections
            const positionsSection = document.getElementById('positions');
            if (positionsSection) {
                const breakDiv = document.createElement('div');
                breakDiv.className = 'html2pdf__page-break';
                positionsSection.parentNode.insertBefore(breakDiv, positionsSection);
                insertedBreaks.push(breakDiv);
            }

            // Insert page break before position cards to prevent slicing across cards
            const posCards = document.querySelectorAll('.position-card');
            posCards.forEach((card, index) => {
                if (index > 0 && index % 2 === 0) {
                    const breakDiv = document.createElement('div');
                    breakDiv.className = 'html2pdf__page-break';
                    card.parentNode.insertBefore(breakDiv, card);
                    insertedBreaks.push(breakDiv);
                }
            });

            // 3. Configure html2pdf options targeting live main content
            const element = document.getElementById('mainContent');
            const opt = {
                margin:       0.4,
                filename:     'KCAU_Elections_Report.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, logging: false },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
                pagebreak:    { mode: ['css', 'legacy'] }
            };

            // Force Plotly charts to resize/relayout for print width if needed
            window.dispatchEvent(new Event('resize'));
            await new Promise(resolve => setTimeout(resolve, 300));

            // 4. Generate & Save PDF
            await html2pdf().set(opt).from(element).save();

        } catch (error) {
            console.error('PDF Export Failed:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            // 5. Clean up temporary page break elements and remove export class
            insertedBreaks.forEach(el => el.remove());
            document.body.classList.remove('pdf-export-mode');

            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}
