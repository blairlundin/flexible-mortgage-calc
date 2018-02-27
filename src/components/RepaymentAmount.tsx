import * as React from 'react';
import { Mortgage } from '../logic/MortgageCalculator';
import { Alert } from 'reactstrap';

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

        var moneyFormat = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

        return (
            <div>
                {repayments ? (
                    <Alert color="info" className="text-center mt-4 mb-3">Repayments: <strong>{moneyFormat.format(repayments)}</strong> {Mortgage.PaymentFrequency[this.props.frequency].toLowerCase()}</Alert>
                ) : (
                    <p>Enter details to find repayment amount</p>
                )}
            </div>
        );
    }

}