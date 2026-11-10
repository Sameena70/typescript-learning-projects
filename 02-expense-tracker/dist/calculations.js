/**
 * Pure calculation functions for personal finance and budgeting metrics.
 */
export class ExpenseCalculations {
    /**
     * Formats a numeric value into INR currency string (₹xx,xxx.xx).
     */
    static formatINR(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
    /**
     * Sums total expenses from an array.
     */
    static calculateTotal(expenses) {
        return expenses.reduce((accumulator, expense) => accumulator + expense.amount, 0);
    }
    /**
     * Computes monthly spending for the current month or given YYYY-MM.
     */
    static calculateMonthlySpending(expenses, yearMonth) {
        const target = yearMonth || new Date().toISOString().slice(0, 7); // Default current 'YYYY-MM'
        return expenses
            .filter(exp => exp.date.startsWith(target))
            .reduce((sum, exp) => sum + exp.amount, 0);
    }
    /**
     * Aggregates expenses by category.
     */
    static calculateCategoryTotals(expenses) {
        return expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});
    }
    /**
     * Finds highest individual expense amount.
     */
    static getHighestExpense(expenses) {
        if (expenses.length === 0)
            return 0;
        return Math.max(...expenses.map(e => e.amount));
    }
    /**
     * Computes average transaction amount.
     */
    static getAverageExpense(expenses) {
        if (expenses.length === 0)
            return 0;
        return this.calculateTotal(expenses) / expenses.length;
    }
    /**
     * Generates a complete financial dashboard overview.
     */
    static generateSummary(expenses, monthlyBudget) {
        const totalSpent = this.calculateTotal(expenses);
        const monthlySpent = this.calculateMonthlySpending(expenses);
        const remainingBudget = monthlyBudget - monthlySpent;
        const isOverBudget = remainingBudget < 0;
        const budgetPercentageUsed = monthlyBudget > 0 ? Math.min((monthlySpent / monthlyBudget) * 100, 100) : 0;
        return {
            totalSpent,
            monthlySpent,
            monthlyBudget,
            remainingBudget,
            transactionCount: expenses.length,
            highestExpense: this.getHighestExpense(expenses),
            averageExpense: this.getAverageExpense(expenses),
            categoryBreakdown: this.calculateCategoryTotals(expenses),
            isOverBudget,
            budgetPercentageUsed
        };
    }
}
