class FMPFinancialReport {
  symbol: string;
  period: string;
  year: string;
  json: JSON;

  constructor(symbol: string, period: string, year: string, json: JSON) {
    this.symbol = symbol;
    this.period = period;
    this.year = year;
    this.json = json;
  }
}

export default FMPFinancialReport;
