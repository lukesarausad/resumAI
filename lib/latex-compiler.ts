import latex from "node-latex"
import { Readable } from "stream"

export async function compileLatexToPDF(latexContent: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const input = Readable.from([latexContent])
    const chunks: Buffer[] = []

    const pdf = latex(input, {
      errorLogs: process.env.NODE_ENV === "development",
    })

    pdf.on("data", (chunk) => {
      chunks.push(chunk)
    })

    pdf.on("end", () => {
      resolve(Buffer.concat(chunks))
    })

    pdf.on("error", (err) => {
      console.error("LaTeX compilation error:", err)
      reject(new Error("Failed to compile LaTeX to PDF"))
    })
  })
}
