import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PaymentFrequency, RepaymentType } from '../logic/MortgageCalculator';

export interface MortgageFormState {
    principal: number;
    extraRepayment: number;
    loanTerm: number;
    interestRate: number;
    frequency: PaymentFrequency;
    repaymentType: RepaymentType;
}

interface MortgageStore extends MortgageFormState {
    setField: <K extends keyof MortgageFormState>(name: K, value: MortgageFormState[K]) => void;
}

export const useMortgageStore = create<MortgageStore>()(
    persist(
        (set) => ({
            principal: 280000,
            extraRepayment: 0,
            loanTerm: 30,
            interestRate: 4,
            frequency: PaymentFrequency.Monthly,
            repaymentType: RepaymentType.PrincipalAndInterest,
            setField: (name, value) => set((state) => ({ ...state, [name]: value })),
        }),
        { name: 'mortgageFormState' }
    )
);
