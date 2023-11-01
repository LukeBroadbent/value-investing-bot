import { writeFileSync } from 'fs';
import { PDFDocument, PDFFont, StandardFonts, rgb } from 'pdf-lib';

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

  public async generatePDF(companySymbol: string, reportTitle: string, data: any) {
    console.log('Generating ' + reportTitle + ' Report for ' + companySymbol);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const fontSize = 12;
    const margin = 50;
    const textWidth = width - 2 * margin;
    const lineHeight = 8;
    // Fonts
    const timesRomanFontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Title
    const titleText = reportTitle;
    const titleSize = 24;

    // Calculate the width of the title text
    const titleWidth = timesRomanFont.widthOfTextAtSize(titleText, titleSize);

    // Calculate the horizontal position to center the title
    const titleX = (width - titleWidth) / 2;

    // Position the title at the top centered horizontally
    const titleY = height - margin;

    // Add the report title on the first page
    pdfDoc.getPages()[0].drawText(titleText, {
      x: titleX,
      y: titleY,
      size: titleSize,
      font: timesRomanFontBold,
      color: rgb(0, 0, 0),
    });

    let pageIdx = 0;
    const pageHeight = height;

    for (const section of data) {
      pageIdx++;

      if (pageIdx >= pdfDoc.getPageCount()) {
        pdfDoc.addPage([600, 800]);
      }

      var currentPage = pdfDoc.getPages()[pageIdx];
      let yOffset = pageHeight - margin;
      let remainingSpace = pageHeight - margin;

      // Add a section header on the current page
      currentPage.drawText(section.header, {
        x: margin,
        y: yOffset,
        size: 18,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });

      yOffset -= 20;

      for (const question of section.questions) {
        yOffset -= 20; // Spacing before question

        // Add question prompt
        const promptLines = this.splitTextIntoLines(question.prompt, timesRomanFont, fontSize, textWidth);
        yOffset -= promptLines.length * fontSize;

        for (const line of promptLines) {
          if (yOffset < margin) {
            // Check if there is not enough space on the current page for the line
            pageIdx++; // Move to the next page
            if (pageIdx >= pdfDoc.getPageCount()) {
              pdfDoc.addPage([600, 800]);
              remainingSpace = pageHeight - margin; // Reset remaining space on the new page
            }
            currentPage = pdfDoc.getPages()[pageIdx];
            yOffset = pageHeight - margin;
          }

          currentPage.drawText(line, {
            x: margin,
            y: yOffset,
            size: fontSize,
            font: timesRomanFontBold,
            color: rgb(0, 0, 0),
          });
          yOffset -= fontSize;
        }

        yOffset -= 20; // Spacing after question

        // Add space between lines for answer lines
        yOffset -= lineHeight;

        // Add question answer
        if (question.answer !== undefined) {
          var testLines = question.answer.split('\n');
          for (const l of testLines) {
            const answerLines = this.splitTextIntoLines(l, timesRomanFont, fontSize, textWidth);

            for (const line of answerLines) {
              if (yOffset < margin) {
                // Check if there is not enough space on the current page for the line
                pageIdx++; // Move to the next page
                if (pageIdx >= pdfDoc.getPageCount()) {
                  pdfDoc.addPage([600, 800]);
                  remainingSpace = pageHeight - margin; // Reset remaining space on the new page
                }
                currentPage = pdfDoc.getPages()[pageIdx];
                yOffset = pageHeight - margin;
              }

              currentPage.drawText(line, {
                x: margin,
                y: yOffset,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
              });

              yOffset -= fontSize;
              // Add space between lines for answer lines
              yOffset -= lineHeight;
            }
          }
        }
      }
    }

    // Serialize the PDFDocument to bytes (a Uint8Array)
    //const pdfBytes = await pdfDoc.save()

    writeFileSync(companySymbol + '-' + reportTitle + '.pdf', await pdfDoc.save());
  }

  splitTextIntoLines(text: string, font: PDFFont, fontSize: number, maxWidth: number) {
    const lines = [];
    const words = text.split(' ');
    let currentLine = '';
    let currentWidth = 0;

    for (const word of words) {
      const wordWidth = font.widthOfTextAtSize(word, fontSize);

      if (currentWidth + wordWidth <= maxWidth) {
        if (currentLine !== '') {
          currentLine += ' ';
          currentWidth += font.widthOfTextAtSize(' ', fontSize);
        }

        currentLine += word;
        currentWidth += wordWidth;
      } else {
        lines.push(currentLine);
        currentLine = word;
        currentWidth = wordWidth;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}
