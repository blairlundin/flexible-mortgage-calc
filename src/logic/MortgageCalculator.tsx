export namespace Mortgage {

    export enum PaymentFrequency {
        Weekly = 52,
        Fortnightly = 26,
        Monthly = 12
    }

    export enum RepaymentType {
        PrincipalAndInterest,
        InterestOnly
    }

    export class MortgageCalculator {
        calculateRepayments(principal: number, loanTerm: number, interestRate: number,
                            frequency: PaymentFrequency, repaymentType: RepaymentType): number {

            let periodicInterestRate = interestRate / 100 / frequency;

            if (repaymentType === RepaymentType.InterestOnly) {
                return (principal * periodicInterestRate);
            }

            let numberOfPayments = loanTerm * frequency;
            let discountFactor = (Math.pow(1 + periodicInterestRate, numberOfPayments) - 1) /
                (periodicInterestRate * Math.pow(1 + periodicInterestRate, numberOfPayments));

            return (principal / discountFactor);
        }
    }
}
