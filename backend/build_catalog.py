"""Build the downloadable catalog from current product records."""
import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle


def build_catalog():
    root = Path(__file__).resolve().parent.parent
    products = json.loads((root / 'backend/products.json').read_text(encoding='utf-8'))
    output = root / 'frontend/static/docs/SUNKA_Battery_Catalogue.pdf'
    styles = getSampleStyleSheet()
    story = [Paragraph('MERI Industries', styles['Title']),
             Paragraph('Supplier of Sunka batteries | Chennai', styles['Heading2']),
             Paragraph('Current product catalog', styles['Heading2']),
             Paragraph('Imported from China. One-year supplier warranty. Contact us to confirm pricing, availability, dimensions and terminals before ordering.', styles['BodyText']), Spacer(1, 18)]
    rows = [['Model', 'Type', 'Voltage', 'Capacity']]
    for product in products:
        lithium = product.get('chemistry_code') == 'lithium'
        rows.append([escape(product['model']), 'Lithium-ion cell' if lithium else 'Sealed lead-acid',
                     '-' if lithium else str(product['voltage']) + 'V',
                     str(round(product['capacity_ah'] * 1000)) + 'mAh' if lithium else str(product['capacity_ah']) + 'Ah'])
    table = Table(rows, colWidths=[190, 125, 65, 90], repeatRows=1)
    table.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,0), colors.HexColor('#15263b')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white), ('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),
        ('FONTSIZE',(0,0),(-1,-1),9), ('BOTTOMPADDING',(0,0),(-1,-1),5),
        ('TOPPADDING',(0,0),(-1,-1),5), ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f1f4f7')])]))
    story += [table, Spacer(1,16), Paragraph('Warranty and enquiries', styles['Heading2']),
              Paragraph('For warranty assistance, contact MERI Industries with your invoice, model and a description of the issue. Request written coverage, exclusions and claim terms with your quotation.', styles['BodyText']),
              Spacer(1,8), Paragraph('+91 7538844410 | merihindustries@gmail.com', styles['BodyText'])]
    SimpleDocTemplate(str(output), topMargin=30, bottomMargin=30).build(story)
    return output

if __name__ == '__main__':
    print(build_catalog())
