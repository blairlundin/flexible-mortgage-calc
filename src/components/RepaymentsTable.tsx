import * as React from 'react';
import { Mortgage } from '../logic/MortgageCalculator';
import { Table } from 'reactstrap';

let mortgageCalc = new Mortgage.MortgageCalculator();

interface RepaymentsTableRow { 
    year: number;
    interest: number | null;
    remainingPrincipal: number;
    totalOwing: number;
}

export default class RepaymentsTable extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }
    
    render() {
        let repayment = mortgageCalc.calculateRepayments(
            this.props.principal,
            this.props.loanTerm,
            this.props.interestRate,
            this.props.frequency,
            this.props.repaymentType);

        let numberOfRepayments = this.props.loanTerm * this.props.frequency;
        let repaymentsArray = [];
        let remainingPrincipal = this.props.principal;
        for (let i = 1; i <= numberOfRepayments; i++) {
            let interest = mortgageCalc.calculateRepayments(
                remainingPrincipal,
                this.props.loanTerm,
                this.props.interestRate,
                this.props.frequency,
                Mortgage.RepaymentType.InterestOnly
            );
            
            remainingPrincipal = remainingPrincipal - (repayment - interest);

            repaymentsArray[i] = {
                interest: interest,
                remainingPrincipal: remainingPrincipal
            };
        }

        const addRepaymentInterest = (a: any, b: any) => a + b.interest;
        let totalOwing = repayment * numberOfRepayments;
        remainingPrincipal = this.props.principal;
        
        let annualPayments: RepaymentsTableRow[] = [];
        annualPayments.push({
            year: 0,
            interest: null,
            remainingPrincipal: remainingPrincipal,
            totalOwing: totalOwing
        });

        for (let i = 1; i <= this.props.loanTerm; i++) {
            let start = (i - 1) * this.props.frequency + 1;
            let end = i * this.props.frequency + 1;
            let annualInterest = repaymentsArray.slice(start, end).reduce(addRepaymentInterest, 0);
            let annualRepayments = repayment * this.props.frequency;
            remainingPrincipal = this.props.repaymentType === Mortgage.RepaymentType.PrincipalAndInterest ? 
                                 remainingPrincipal - (annualRepayments - annualInterest)
                                 : remainingPrincipal;
            totalOwing = totalOwing - annualRepayments;
            annualPayments.push({
                year: i,
                interest: annualInterest,
                remainingPrincipal: remainingPrincipal,
                totalOwing: totalOwing
            });
        }

        var moneyFormat = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

        var tableRows = annualPayments.map(function(row: RepaymentsTableRow) {
            return (
                <tr key={row.year}>
                    <th scope="row">{row.year === 0 ? '' : row.year}</th>
                    <td>{row.interest == null ? '' : moneyFormat.format(row.interest)}</td>
                    <td>{row.remainingPrincipal < 0 ? moneyFormat.format(0) : moneyFormat.format(row.remainingPrincipal)}</td>
                    <td>{row.totalOwing < 0 ? moneyFormat.format(0) : moneyFormat.format(row.totalOwing)}</td>
                </tr>
            );
        });

        return (
            <Table>
                <thead>
                    <tr>
                        <th>Year</th>
                        <th>Interest</th>
                        <th>Principal</th>
                        <th>Owing</th>
                    </tr>
                </thead>
                <tbody>
                    {tableRows}
                </tbody>
            </Table>
        );
    }

}
