import BusinessOverview from "../models/reports/businessOverview.js";
import FileReadWriteService from "../services/FileReadWriteService.js";
import PDFGeneratorService from "../services/PDFGeneratorService.js";

const fileName = ""

export async function generateBusinessOverviewReport() {
    var output: { header: string; questions: { prompt: string; answer: string; }[]; }[] = []    
    var jsonObject = JSON.parse(FileReadWriteService.getInstance().readPromptsFromFile("businessOverview.json"))

    Object.entries(jsonObject).forEach(([header, prompts]) => {
        var entries: { prompt: string; answer: string; }[] = []
        Object.entries(prompts as string).forEach(p => {
            var openAIPrompt = p[1].replace("{company}", "Paypal")
            // Query OpenAI
            var answer = ""
            entries.push({ prompt: openAIPrompt, answer: answer })
        })
        output.push({header: header, questions: entries})
    })

    output.forEach((item, index) => {
        console.log(item.header)
        for (const test in item.questions) {
            if (item.questions.hasOwnProperty(test)) {
                console.log(`${item.questions[test].prompt} ${item.questions[test].answer}`)
            }
        }
        console.log("\n")
    })

    // PDFGeneratorService.getInstance().generatePDF(output)
}