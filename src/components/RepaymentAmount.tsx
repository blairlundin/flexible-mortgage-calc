import * as React from 'react';
import { Mortgage } from '../logic/MortgageCalculator';

let mortgageCalc = new Mortgage.MortgageCalculator();
export default class RepaymentAmount extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        let repayments = mortgageCalc.calculateRepayments(
            this.props.principal,
            this.props.loanTerm,
            this.props.interestRate,
            this.props.frequency,
            this.props.repaymentType);

        return (
            <div>
                {repayments ? (
                    <p>Repayment: ${repayments.toFixed(2)} {Mortgage.PaymentFrequency[this.props.frequency]}</p>
                ) : (
                        <p>Enter details to find repayment amount</p>
                    )}
            </div>
        );
    }

}