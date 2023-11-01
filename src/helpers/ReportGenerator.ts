import FileReadWriteService from '../services/FileReadWriteService.js';
import ValueBotService from '../services/ValueBotService.js';

export async function generateBusinessOverviewReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('businessOverview.json', companyName);

  var promptsAnswersObject = await runAllPrompts(promptsObject);

  // PDFGeneratorService.getInstance().generatePDF(output)
}

export async function generateCompetativeAdvantageReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('competativeAdvantage.json', companyName);
}

export async function generateCSRReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('csr.json', companyName);
}

export async function generateDividendPolicyReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('dividentPolicies.json', companyName);
}

export async function generateEarningsCallReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('earningsCalls.json', companyName);
}

export async function generateFinancialsReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('financials.json', companyName);
}

export async function generateGrowthProspectsReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('growthProspects.json', companyName);
}

export async function generateHistoricalPerformanceReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('historicalPerformance.json', companyName);
}

export async function generateIndustryMarketAnalysisReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('industryMarketAnalysis.json', companyName);
}

export async function generateKeyFinancialEventsReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('keyFinancialEvents.json', companyName);
}

export async function generateMacroEnvironmmentReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('macroEnvironment.json', companyName);
}

export async function generateManagementLeadershipReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('managementLeadership.json', companyName);
}

export async function generateNewsEventsReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('newsEvents.json', companyName);
}

export async function generatePeerAnalysisReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('peerAnalysis.json', companyName);
}

export async function generatePriceIntrinsicValueReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('priceIntrinsicValue.json', companyName);
}

export async function generateRiskChallengesReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('riskChallenges.json', companyName);
}

export async function generateShareBuybackPoliciesReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('shareBuybackPolicies.json', companyName);
}

export async function generateSwotAnalysisReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('swotAnalysis.json', companyName);
}

export async function generateValuationMetricsReport(companyName: string) {
  var promptsObject = await getPromptsListFromFile('valuationMetrics.json', companyName);
}

async function getPromptsListFromFile(fileName: string, companyName: string) {
  // Gets Prompts from file
  var jsonObject = await JSON.parse(FileReadWriteService.getInstance().readPromptsFromFile(fileName));

  // Gathers Prompts and stores in object
  var output: { header: string; questions: { prompt: string; answer: string }[] }[] = [];
  Object.entries(jsonObject).forEach(([header, prompts]) => {
    var entries: { prompt: string; answer: string }[] = [];
    Object.entries(prompts as string).forEach((p) => {
      entries.push({ prompt: p[1].replace('{company}', companyName), answer: '' });
    });
    output.push({ header: header, questions: entries });
  });

  return output;
}

async function runAllPrompts(promptsObject: any) {
  for (const item of promptsObject) {
    console.log(item.header);
    for (const question in item.questions) {
      item.questions[question].answer = await ValueBotService.getInstance().answerPrompt(
        item.questions[question].prompt
      );
      console.log(item.questions[question].prompt);
      console.log(item.questions[question].answer);
      console.log('\n\n');
      break;
    }
  }
  return promptsObject;
}
