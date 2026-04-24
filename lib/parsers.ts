export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const PDFParser = (await import('pdf2json')).default
    
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser(null, true)
      
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          const text = pdfData.Pages
            .map((page: any) =>
              page.Texts
                .map((t: any) =>
                  t.R.map((r: any) => decodeURIComponent(r.T)).join(' ')
                )
                .join(' ')
            )
            .join('\n')
          resolve(text)
        } catch {
          reject(new Error('Failed to extract text from PDF'))
        }
      })

      pdfParser.on('pdfParser_dataError', (err: any) => {
        reject(new Error(err.parserError || 'PDF parsing failed'))
      })

      pdfParser.parseBuffer(buffer)
    })
  } catch (err) {
    console.error('PDF parse error:', err)
    throw new Error('Failed to parse PDF. Make sure the file is not password-protected.')
  }
}

export async function parseDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}