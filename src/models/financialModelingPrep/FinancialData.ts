import BalanceSheet from "./BalanceSheet.js"
import CashFlows from "./CashFlow.js"
import IncomeStatement from "./IncomeStatement.js"
import Ratios from "./Ratios.js"

class FinancialData {
    "financial_year": string
    "balance_sheet": BalanceSheet
    "income_statement": IncomeStatement
    "cash_flow": CashFlows
    "ratios": Ratios
}

export default FinancialData