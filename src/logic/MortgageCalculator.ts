export enum PaymentFrequency {
    Weekly = 52,
    Fortnightly = 26,
    Monthly = 12
}

export enum RepaymentType {
    PrincipalAndInterest,
    InterestOnly
}

export interface MortgageRepayment {
    interest: number;
    principal: number;
    remainingPrincipal: number;
    amountOwing: number;
}

export interface MortgageAmortisation {
    repaymentAmount: number;
    repayments: MortgageRepayment[];
}

export class MortgageCalculator {
    calculateRepayments(principal: number, loanTerm: number, interestRate: number,
                        frequency: PaymentFrequency, repaymentType: RepaymentType): number {

        const periodicInterestRate = interestRate / 100 / frequency;

        if (repaymentType === RepaymentType.InterestOnly) {
            return principal * periodicInterestRate;
        }

        const numberOfPayments = loanTerm * frequency;
        const discountFactor = (Math.pow(1 + periodicInterestRate, numberOfPayments) - 1) /
            (periodicInterestRate * Math.pow(1 + periodicInterestRate, numberOfPayments));

        return principal / discountFactor;
    }
}
