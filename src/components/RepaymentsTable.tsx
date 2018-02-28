import * as React from 'react';
import { Mortgage } from '../logic/MortgageCalculator';
import { Table } from 'reactstrap';
import { Line } from 'react-chartjs-2';

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

        var chartData = {
            labels: annualPayments.map(a => a.year.toString(10)),
            datasets: [
              {
                label: 'Total amount owing',
                fill: true,
                lineTension: 0.1,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: annualPayments.map(a => parseFloat(a.totalOwing.toFixed(2)))
              }
            ]
        };

        return (
            <div>
                <Line data={chartData} />
                <Table className="table-sm mt-5">
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
            </div>
        );
    }

}
