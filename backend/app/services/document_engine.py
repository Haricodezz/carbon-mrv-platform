import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.barcode import qr
from reportlab.lib.enums import TA_CENTER, TA_LEFT

# Premium ESG Brand Colors
DEEP_GREEN = colors.HexColor("#0A3B28")
EMERALD = colors.HexColor("#107A4B")
NAVY = colors.HexColor("#0A192F")
GOLD = colors.HexColor("#C5A059")
OFF_WHITE = colors.HexColor("#F9F9F9")
GRAY_BORDER = colors.HexColor("#E0E0E0")
TEXT_DARK = colors.HexColor("#2C3E50")
TEXT_MUTED = colors.HexColor("#7F8C8D")

class PremiumDocumentEngine:
    def __init__(self, filename, title="Document", doc_type="REPORT"):
        self.filename = filename
        self.title = title
        self.doc_type = doc_type
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(os.path.abspath(self.filename)), exist_ok=True)
        
        # Setup document
        self.doc = SimpleDocTemplate(
            self.filename,
            pagesize=A4,
            rightMargin=inch,
            leftMargin=inch,
            topMargin=1.5*inch,
            bottomMargin=inch
        )
        self.story = []
        self.styles = self._build_styles()
        
    def _build_styles(self):
        styles = getSampleStyleSheet()
        
        styles.add(ParagraphStyle(
            name='InstitutionalTitle',
            parent=styles['Heading1'],
            fontName='Times-Bold',
            fontSize=22,
            textColor=DEEP_GREEN,
            alignment=TA_LEFT,
            spaceAfter=0.3*inch
        ))
        
        styles.add(ParagraphStyle(
            name='DocumentType',
            fontName='Helvetica-Bold',
            fontSize=10,
            textColor=GOLD,
            alignment=TA_LEFT,
            spaceAfter=0.1*inch,
            textTransform='uppercase'
        ))

        styles.add(ParagraphStyle(
            name='SectionHeader',
            fontName='Times-Bold',
            fontSize=14,
            textColor=NAVY,
            alignment=TA_LEFT,
            spaceBefore=0.25*inch,
            spaceAfter=0.15*inch
        ))
        
        styles.add(ParagraphStyle(
            name='DataLabel',
            fontName='Helvetica-Bold',
            fontSize=9,
            textColor=TEXT_MUTED,
            alignment=TA_LEFT,
            textTransform='uppercase'
        ))
        
        styles.add(ParagraphStyle(
            name='DataValue',
            fontName='Helvetica',
            fontSize=11,
            textColor=TEXT_DARK,
            alignment=TA_LEFT,
            spaceAfter=0.1*inch
        ))
        
        styles.add(ParagraphStyle(
            name='Disclaimer',
            fontName='Helvetica-Oblique',
            fontSize=9,
            textColor=TEXT_MUTED,
            alignment=TA_CENTER
        ))

        return styles
        
    def _header_footer(self, canvas, doc):
        canvas.saveState()
        
        # Header Line
        canvas.setStrokeColor(GOLD)
        canvas.setLineWidth(2)
        canvas.line(inch, A4[1] - 0.8*inch, A4[0] - inch, A4[1] - 0.8*inch)
        
        # Header Text
        canvas.setFont('Times-Bold', 12)
        canvas.setFillColor(DEEP_GREEN)
        canvas.drawString(inch, A4[1] - 0.65*inch, "CARBON MRV REGISTRY")
        
        canvas.setFont('Helvetica-Bold', 8)
        canvas.setFillColor(TEXT_MUTED)
        canvas.drawRightString(A4[0] - inch, A4[1] - 0.65*inch, f"ISSUED: {datetime.utcnow().strftime('%Y-%m-%d UTC')}")
        
        # Footer Line
        canvas.setStrokeColor(GRAY_BORDER)
        canvas.setLineWidth(1)
        canvas.line(inch, 0.8*inch, A4[0] - inch, 0.8*inch)
        
        # Footer Text
        canvas.setFont('Helvetica-Bold', 8)
        canvas.setFillColor(DEEP_GREEN)
        canvas.drawString(inch, 0.6*inch, "BLOCKCHAIN VERIFIABLE ASSET | INSTITUTIONAL GRADE ESG REPORT")
        canvas.setFillColor(TEXT_MUTED)
        canvas.drawRightString(A4[0] - inch, 0.6*inch, f"Page {doc.page}")
        
        # Watermark
        canvas.setFont('Times-Bold', 80)
        canvas.setFillColor(colors.Color(0.04, 0.23, 0.15, alpha=0.03))
        canvas.saveState()
        canvas.translate(A4[0]/2, A4[1]/2)
        canvas.rotate(45)
        canvas.drawCentredString(0, 0, "VERIFIED")
        canvas.restoreState()
        
        canvas.restoreState()
        
    def add_title(self, main_title, doc_type="CERTIFICATE"):
        self.story.append(Paragraph(doc_type, self.styles['DocumentType']))
        self.story.append(Paragraph(main_title, self.styles['InstitutionalTitle']))
        self.story.append(Spacer(1, 0.2*inch))
        
    def add_section_header(self, title):
        self.story.append(Paragraph(title, self.styles['SectionHeader']))
        
    def add_data_grid(self, data_dict, columns=2):
        table_data = []
        row = []
        for label, value in data_dict.items():
            cell_data = [
                Paragraph(str(label), self.styles['DataLabel']),
                Paragraph(str(value) if value is not None else "N/A", self.styles['DataValue'])
            ]
            row.append(cell_data)
            if len(row) == columns:
                table_data.append(row)
                row = []
        if row:
            while len(row) < columns:
                row.append([
                    Paragraph("", self.styles['DataLabel']),
                    Paragraph("", self.styles['DataValue'])
                ])
            table_data.append(row)
            
        t = Table(table_data, colWidths=[(A4[0]-2*inch)/columns]*columns)
        t.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('BACKGROUND', (0,0), (-1,-1), OFF_WHITE),
            ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
            ('BOX', (0,0), (-1,-1), 1, DEEP_GREEN)
        ]))
        self.story.append(t)
        self.story.append(Spacer(1, 0.2*inch))

    def add_blockchain_verification(self, tx_hash, token_id=None):
        self.add_section_header("Immutable Verification")
        blockchain_data = {
            "Network": "Polygon (Mainnet Compatible)",
            "Standard": "ERC-20 Carbon Token",
            "Transaction Hash": str(tx_hash) if tx_hash else "Pending Confirmation",
        }
        if token_id:
            blockchain_data["Token ID"] = str(token_id)
        self.add_data_grid(blockchain_data, columns=1)

    def add_qr_code(self, data_url):
        qr_code = qr.QrCodeWidget(data_url)
        bounds = qr_code.getBounds()
        width = bounds[2] - bounds[0]
        height = bounds[3] - bounds[1]
        
        d = Drawing(100, 100, transform=[100/width,0,0,100/height,0,0])
        d.add(qr_code)
        
        t = Table([[Paragraph("<b>Scan to verify</b><br/>on Blockchain Explorer", self.styles['DataLabel']), d]], 
                  colWidths=[A4[0]-2*inch - 1.5*inch, 1.5*inch])
        t.setStyle(TableStyle([
            ('ALIGN', (1,0), (1,0), 'RIGHT'), 
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
        ]))
        self.story.append(t)
        self.story.append(Spacer(1, 0.2*inch))
        
    def add_signature_block(self, signatories):
        self.story.append(Spacer(1, 0.6*inch))
        if len(signatories) == 2:
            t = Table([
                ["__________________________", "__________________________"],
                [Paragraph(f"<b>{signatories[0][0]}</b><br/>{signatories[0][1]}", self.styles['DataValue']),
                 Paragraph(f"<b>{signatories[1][0]}</b><br/>{signatories[1][1]}", self.styles['DataValue'])]
            ], colWidths=[(A4[0]-2*inch)/2]*2)
        else:
            rows = []
            for name, title in signatories:
                rows.append(["__________________________"])
                rows.append([Paragraph(f"<b>{name}</b><br/>{title}", self.styles['DataValue'])])
                rows.append([""])
            t = Table(rows, colWidths=[A4[0]-2*inch])
            
        t.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
        self.story.append(t)
        self.story.append(Spacer(1, 0.4*inch))

    def add_paragraph(self, text, style='DataValue'):
        self.story.append(Paragraph(text, self.styles[style]))
        self.story.append(Spacer(1, 0.1*inch))
        
    def add_disclaimer(self, text):
        self.story.append(Spacer(1, 0.2*inch))
        self.story.append(Paragraph(text, self.styles['Disclaimer']))

    def build(self):
        self.doc.build(self.story, onFirstPage=self._header_footer, onLaterPages=self._header_footer)
        return self.filename
