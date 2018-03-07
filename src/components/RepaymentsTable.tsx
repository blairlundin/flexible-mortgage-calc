import * as React from 'react';
import { Mortgage } from '../logic/MortgageCalculator';
import { Alert, Table } from 'reactstrap';
import { Line } from 'react-chartjs-2';
import { isNullOrUndefined } from 'util';
import { Container, Row, Col } from 'reactstrap';

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

        repayment += parseInt(this.props.extraRepayment, 10);

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
            
            let principalReduction = repayment - interest;
            if (principalReduction > remainingPrincipal) {
                remainingPrincipal = 0;
            } else {
                remainingPrincipal -= principalReduction;
            }

            repaymentsArray[i] = {
                interest: interest,
                remainingPrincipal: remainingPrincipal
            };

            if (remainingPrincipal === 0) {
                break;
            }
        }

        const addRepaymentInterest = (a: any, b: any) => a + b.interest;
        let totalInterest = repaymentsArray.reduce(addRepaymentInterest, 0);
        let totalOwing = totalInterest + this.props.principal;

        remainingPrincipal = this.props.principal;
        
        let annualPayments: RepaymentsTableRow[] = [];
        annualPayments.push({
            year: 0,
            interest: null,
            remainingPrincipal: remainingPrincipal,
            totalOwing: totalOwing
        });

        const yearsUntilPaidOff = Math.floor((repaymentsArray.length - 1) / this.props.frequency);
        const monthsUntilPaidOff = (repaymentsArray.length - 1) % this.props.frequency;

        let loopYears = Math.ceil((repaymentsArray.length - 1) / this.props.frequency);
        for (let i = 1; i <= loopYears; i++) {
            let start = (i - 1) * this.props.frequency + 1;
            let end = i * this.props.frequency + 1;
            let annualInterest = repaymentsArray.slice(start, end).reduce(addRepaymentInterest, 0);
            let annualRepayments = repayment * this.props.frequency;
            let principalToDeduct = annualRepayments - annualInterest;
            
            if (principalToDeduct > remainingPrincipal) {
                remainingPrincipal = 0;
                totalOwing = this.props.repaymentType === Mortgage.RepaymentType.PrincipalAndInterest ? 0 : this.props.principal;
            } else {
                remainingPrincipal = this.props.repaymentType === Mortgage.RepaymentType.PrincipalAndInterest ? 
                                    remainingPrincipal - principalToDeduct
                                    : remainingPrincipal;
                totalOwing = totalOwing - annualRepayments;
            }
            
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
                    <td>{moneyFormat.format(row.remainingPrincipal)}</td>
                    <td>{moneyFormat.format(row.totalOwing)}</td>
                </tr>
            );
        });

        var chartData: Chart.ChartData = {
            labels: annualPayments.map(a => a.year.toString(10)),
            datasets: [
              {
                label: 'Owing',
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
                pointRadius: 3,
                pointHitRadius: 10,
                data: annualPayments.map(a => parseFloat(a.totalOwing.toFixed(2)))
              },
              {
                label: 'Principal',
                fill: true,
                lineTension: 0.1,
                backgroundColor: 'rgba(75,192,192,0.8)',
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
                pointRadius: 3,
                pointHitRadius: 10,
                data: annualPayments.map(a => parseFloat(a.remainingPrincipal.toFixed(2)))
              }
            ]
        };

        var chartOptions: Chart.ChartOptions = {
            animation: {
                duration: 500
            },
            responsive: true,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Year'
                    },
                    ticks: {
                        min: 0,
                        callback: function(value: any, index: any, values: any): string {
                            let intValue = parseInt(value, 10);

                            if (intValue % 5 === 0) {
                                return intValue.toString();
                            } else {
                                return '';
                            }
                        }
                    }
                }],
                yAxes: [{
                    ticks: {
                        min: 0,
                        callback: function(value: any, index: any, values: any): string {
                            let intValue = parseInt(value, 10);
                            if (intValue === 0) {
                                return '$0';
                            }
                            if (intValue % 100000 === 0) {
                                return '$' + (intValue / 1000) + 'k';
                            } else {
                                return '';
                            }
                        }
                    }
                }]
            },
            tooltips: {
                mode: 'index',
                callbacks: {
                    title: function(tooltips: Chart.ChartTooltipItem[], data: Chart.ChartData) {
                        if (isNullOrUndefined(data.labels) || isNullOrUndefined(tooltips[0]) || isNullOrUndefined(tooltips[0].index)) {
                            return '';
                        }

                        return 'Year '  + tooltips[0].index;
                    },
                    label: function(tooltipItem: Chart.ChartTooltipItem, data: Chart.ChartData): string {
                        if (isNullOrUndefined(data.datasets) || isNullOrUndefined(tooltipItem.datasetIndex) || isNullOrUndefined(tooltipItem.yLabel)) {
                            return '';
                        }
                        
                        var label = data.datasets[tooltipItem.datasetIndex].label || '';
    
                        if (label) {
                            label += ': ';
                        }
                        label += moneyFormat.format(parseFloat(tooltipItem.yLabel));
                        return label;
                    }
                }
            }
        };

        return (
            <Container>
                <Row>
                    <Col sm={{ size: 6, offset: 3 }}>
                    <Alert color="info" className="text-center mt-4 mb-3">
                        Repayments: <strong>{moneyFormat.format(repayment)}</strong> {Mortgage.PaymentFrequency[this.props.frequency].toLowerCase()}
                        <p className="mb-0">Total interest payable: <strong>{moneyFormat.format(totalInterest)}</strong></p>
                        <p>Time until paid off: <strong>{yearsUntilPaidOff} years {monthsUntilPaidOff} months</strong></p>
                    </Alert>
                    </Col>
                </Row>
                
                <Row>
                    <Col sm={{ size: 8, offset: 2 }}>
                        <Line data={chartData} options={chartOptions} />
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
                    </Col>
                </Row>
            </Container>
        );
    }

}
