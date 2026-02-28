import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PaymentFrequency, RepaymentType, OffsetEntry } from '../logic/MortgageCalculator';

export type { OffsetEntry };

export interface MortgageFormState {
    principal: number;
    extraRepayment: number;
    loanTerm: number;
    interestRate: number;
    frequency: PaymentFrequency;
    repaymentType: RepaymentType;
    offsetEnabled: boolean;
    offsetEntries: OffsetEntry[];
}

interface MortgageStore extends MortgageFormState {
    setField: <K extends keyof MortgageFormState>(name: K, value: MortgageFormState[K]) => void;
    addOffsetEntry: (entry: OffsetEntry) => void;
    removeOffsetEntry: (index: number) => void;
    updateOffsetEntry: (index: number, entry: OffsetEntry) => void;
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
            offsetEnabled: false,
            offsetEntries: [],
            setField: (name, value) => set((state) => ({ ...state, [name]: value })),
            addOffsetEntry: (entry) => set((state) => ({
                offsetEntries: [...state.offsetEntries, entry],
            })),
            removeOffsetEntry: (index) => set((state) => ({
                offsetEntries: state.offsetEntries.filter((_, i) => i !== index),
            })),
            updateOffsetEntry: (index, entry) => set((state) => ({
                offsetEntries: state.offsetEntries.map((e, i) => i === index ? entry : e),
            })),
        }),
        { name: 'mortgageFormState' }
    )
);
