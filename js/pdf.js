/**
 * SafeTap PDF Generation Module
 * Creates emergency incident reports
 */

const PDFReporter = {
    async generateReport(alertData) {
        if (typeof jspdf === 'undefined') {
            await this.loadLibrary();
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Styles and Content
        doc.setFontSize(22);
        doc.setTextColor(239, 68, 68); // Red
        doc.text("SafeTap Emergency Incident Report", 20, 30);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45);

        doc.setLineWidth(0.5);
        doc.line(20, 50, 190, 50);

        // Incident Data
        let y = 65;
        const fields = [
            ["Incident Type", alertData.type || "SOS"],
            ["Status", alertData.status || "Active"],
            ["Timestamp", new Date(alertData.timestamp).toLocaleString()],
            ["Latitude", alertData.latitude?.toString() || "N/A"],
            ["Longitude", alertData.longitude?.toString() || "N/A"],
            ["Accuracy", `${alertData.accuracy || 0} meters`],
            ["Maps Link", alertData.maps_link || "N/A"]
        ];

        fields.forEach(([label, value]) => {
            doc.setFont("helvetica", "bold");
            doc.text(`${label}:`, 20, y);
            doc.setFont("helvetica", "normal");
            doc.text(value, 60, y);
            y += 10;
        });

        doc.save(`SafeTap_Report_${Date.now()}.pdf`);
        Toasts.show("PDF Report Downloaded", "success");
    },

    loadLibrary() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
            script.onload = () => resolve();
            document.head.appendChild(script);
        });
    }
};

window.PDFReporter = PDFReporter;
