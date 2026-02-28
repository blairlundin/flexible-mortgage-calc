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

export interface OffsetEntry {
    fromMonth: number;  // month relative to loan start (0 = start)
    balance: number;    // offset balance from this point onward
}

export interface AnnualPayment {
    year: number;
    interest: number | null;
    remainingPrincipal: number;
    totalOwing: number;
}

export interface AmortizationResult {
    repaymentAmount: number;
    periodsCount: number;
    totalInterest: number;
    yearsUntilPaidOff: number;
    monthsUntilPaidOff: number;
    annualPayments: AnnualPayment[];
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

function getCurrentOffset(
    period: number,
    entries: OffsetEntry[],
    frequency: PaymentFrequency
): number {
    const sorted = [...entries].sort((a, b) => a.fromMonth - b.fromMonth);
    let balance = 0;
    for (const entry of sorted) {
        const fromPeriod = Math.round(entry.fromMonth * (frequency / 12));
        if (fromPeriod <= period) {
            balance = entry.balance;
        } else {
            break;
        }
    }
    return balance;
}

export function computeAmortization(
    principal: number,
    loanTerm: number,
    interestRate: number,
    frequency: PaymentFrequency,
    repaymentType: RepaymentType,
    extraRepayment: number,
    offsetEntries?: OffsetEntry[]
): AmortizationResult {
    const calc = new MortgageCalculator();
    let repayment = calc.calculateRepayments(principal, loanTerm, interestRate, frequency, repaymentType);
    if (repaymentType !== RepaymentType.InterestOnly) {
        repayment += extraRepayment;
    }

    const numberOfRepayments = loanTerm * frequency;
    const periods: { interest: number; remainingPrincipal: number }[] = [];
    let remainingPrincipal = principal;

    for (let i = 0; i < numberOfRepayments; i++) {
        const period = i + 1;
        const offsetBalance = offsetEntries ? getCurrentOffset(period, offsetEntries, frequency) : 0;
        const effectivePrincipal = Math.max(0, remainingPrincipal - offsetBalance);
        const interest = calc.calculateRepayments(
            effectivePrincipal, loanTerm, interestRate, frequency, RepaymentType.InterestOnly
        );

        if (repaymentType === RepaymentType.PrincipalAndInterest) {
            const principalReduction = repayment - interest;
            if (principalReduction > remainingPrincipal) {
                remainingPrincipal = 0;
            } else {
                remainingPrincipal -= principalReduction;
            }
        }

        periods.push({ interest, remainingPrincipal });

        if (repaymentType === RepaymentType.PrincipalAndInterest && remainingPrincipal < 0.01) {
            remainingPrincipal = 0;
            break;
        }
    }

    const periodsCount = periods.length;
    const totalInterest = periods.reduce((a, b) => a + b.interest, 0);
    let totalOwing = totalInterest + principal;

    const yearsUntilPaidOff = Math.floor(periodsCount / frequency);
    const remainingPeriodsForMonths = periodsCount % frequency;
    const monthsUntilPaidOff = Math.round(remainingPeriodsForMonths / (frequency / 12));

    // Build annual payments table
    remainingPrincipal = principal;
    const annualPayments: AnnualPayment[] = [];
    annualPayments.push({ year: 0, interest: null, remainingPrincipal, totalOwing });

    const loopYears = Math.ceil(periodsCount / frequency);
    for (let y = 1; y <= loopYears; y++) {
        const start = (y - 1) * frequency;
        const end = y * frequency;
        const yearSlice = periods.slice(start, end);
        const annualInterest = yearSlice.reduce((a, b) => a + b.interest, 0);
        const annualRepayments = repayment * yearSlice.length;
        const principalToDeduct = annualRepayments - annualInterest;
        // For IO, only decrement totalOwing by actual interest paid (not fixed repayment)
        const effectiveAnnualRepayments = repaymentType === RepaymentType.PrincipalAndInterest
            ? annualRepayments
            : annualInterest;

        if (principalToDeduct > remainingPrincipal) {
            remainingPrincipal = 0;
            totalOwing = repaymentType === RepaymentType.PrincipalAndInterest ? 0 : principal;
        } else {
            remainingPrincipal = repaymentType === RepaymentType.PrincipalAndInterest
                ? remainingPrincipal - principalToDeduct
                : remainingPrincipal;
            totalOwing -= effectiveAnnualRepayments;
        }

        annualPayments.push({ year: y, interest: annualInterest, remainingPrincipal, totalOwing });
    }

    return {
        repaymentAmount: repayment,
        periodsCount,
        totalInterest,
        yearsUntilPaidOff,
        monthsUntilPaidOff,
        annualPayments,
    };
}
