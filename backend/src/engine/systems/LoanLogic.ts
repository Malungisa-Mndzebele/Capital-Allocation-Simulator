// Loan system for education, business, and real estate

export interface Loan {
    id: string;
    type: 'student' | 'business' | 'mortgage';
    principal: number;
    balance: number;
    interestRate: number;
    monthlyPayment: number;
    remainingMonths: number;
    originationMonth: number;
}

export class LoanLogic {
    static calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
        const monthlyRate = annualRate / 12;
        if (monthlyRate === 0) return principal / months;
        return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    }

    static createLoan(type: 'student' | 'business' | 'mortgage', amount: number, currentMonth: number, creditScore: number = 700): Loan {
        let interestRate: number;
        let termMonths: number;

        switch (type) {
            case 'student':
                interestRate = 0.045; // 4.5% for student loans
                termMonths = 120; // 10 years
                break;
            case 'business':
                interestRate = 0.08 + (700 - creditScore) / 10000; // 8% base, adjusted by credit
                termMonths = 60; // 5 years
                break;
            case 'mortgage':
                interestRate = 0.065 + (700 - creditScore) / 10000; // 6.5% base
                termMonths = 360; // 30 years
                break;
        }

        const monthlyPayment = this.calculateMonthlyPayment(amount, interestRate, termMonths);

        return {
            id: `loan_${type}_${Date.now()}`,
            type,
            principal: amount,
            balance: amount,
            interestRate,
            monthlyPayment,
            remainingMonths: termMonths,
            originationMonth: currentMonth
        };
    }

    static processMonthlyPayments(loans: Loan[]): { totalPayment: number; updatedLoans: Loan[]; paidOffLoans: string[] } {
        let totalPayment = 0;
        const paidOffLoans: string[] = [];
        
        const updatedLoans = loans.map(loan => {
            if (loan.remainingMonths <= 0) return loan;

            const interestCharge = loan.balance * (loan.interestRate / 12);
            const principalPayment = loan.monthlyPayment - interestCharge;
            
            const newBalance = Math.max(0, loan.balance - principalPayment);
            const newRemaining = loan.remainingMonths - 1;

            totalPayment += loan.monthlyPayment;

            if (newBalance === 0 || newRemaining === 0) {
                paidOffLoans.push(loan.id);
            }

            return {
                ...loan,
                balance: newBalance,
                remainingMonths: newRemaining
            };
        }).filter(loan => loan.balance > 0 && loan.remainingMonths > 0);

        return { totalPayment, updatedLoans, paidOffLoans };
    }

    static calculateCreditScore(state: any): number {
        let score = 700; // Base score

        // Payment history (most important)
        const loanCount = state.loans?.length || 0;
        if (loanCount > 0) score += 20; // Having loans and paying them builds credit

        // Cash reserves
        if (state.cash > 10000) score += 30;
        else if (state.cash < 0) score -= 100;

        // Net worth
        if (state.netWorth > 100000) score += 50;
        else if (state.netWorth < 0) score -= 50;

        // Bankruptcy history
        if (state.lifestyle?.monthsHomeless > 0) score -= 150;

        // Age of credit (months in game)
        score += Math.min(50, state.month);

        return Math.max(300, Math.min(850, score));
    }
}
