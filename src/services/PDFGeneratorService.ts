import { writeFileSync } from 'fs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default class PDFGeneratorService {
  private static _instance: PDFGeneratorService = new PDFGeneratorService();

  constructor() {
    if (PDFGeneratorService._instance) {
      throw new Error('Error: Instantiation failed: Use PDFGeneratorService.getInstance() instead of new.');
    }

    PDFGeneratorService._instance = this;
  }

  public static getInstance(): PDFGeneratorService {
    return PDFGeneratorService._instance;
  }

  public async generatePDF(data: any) {
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const page = pdfDoc.addPage([400, 600]);
    const { width, height } = page.getSize();

    // Draw a string of text toward the top of the page
    const fontSize = 30;
    page.drawText('Creating PDFs in JavaScript is awesome!', {
      x: 50,
      y: height - 4 * fontSize,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0.53, 0.71),
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    //const pdfBytes = await pdfDoc.save()

    writeFileSync('hello.pdf', await pdfDoc.save());
  }
}
