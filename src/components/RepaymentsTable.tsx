import { PaymentFrequency, RepaymentType, MortgageCalculator } from '../logic/MortgageCalculator';
import { Alert, Table } from 'reactstrap';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import type { ChartData, ChartOptions, TooltipItem } from 'chart.js';
import { Container, Row, Col } from 'reactstrap';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const mortgageCalc = new MortgageCalculator();
const moneyFormat = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

interface RepaymentsTableProps {
    principal: number;
    extraRepayment: number;
    loanTerm: number;
    interestRate: number;
    frequency: PaymentFrequency;
    repaymentType: RepaymentType;
}

interface RepaymentsTableRow {
    year: number;
    interest: number | null;
    remainingPrincipal: number;
    totalOwing: number;
}

export default function RepaymentsTable({
    principal, extraRepayment, loanTerm, interestRate, frequency, repaymentType
}: RepaymentsTableProps) {
    let repayment = mortgageCalc.calculateRepayments(
        principal, loanTerm, interestRate, frequency, repaymentType);

    if (repaymentType !== RepaymentType.InterestOnly) {
        repayment += extraRepayment;
    }

    const numberOfRepayments = loanTerm * frequency;
    const repaymentsArray = [];
    let remainingPrincipal = principal;
    for (let i = 1; i <= numberOfRepayments; i++) {
        const interest = mortgageCalc.calculateRepayments(
            remainingPrincipal, loanTerm, interestRate, frequency, RepaymentType.InterestOnly
        );

        const principalReduction = repayment - interest;
        if (principalReduction > remainingPrincipal) {
            remainingPrincipal = 0;
        } else {
            remainingPrincipal -= principalReduction;
        }

        repaymentsArray[i] = {
            interest: interest,
            remainingPrincipal: remainingPrincipal
        };

        if (remainingPrincipal < 0.01) {
            remainingPrincipal = 0;
            break;
        }
    }

    const addRepaymentInterest = (a: number, b: { interest: number }) => a + b.interest;
    const totalInterest = repaymentsArray.reduce(addRepaymentInterest, 0);
    let totalOwing = totalInterest + principal;

    remainingPrincipal = principal;

    const annualPayments: RepaymentsTableRow[] = [];
    annualPayments.push({
        year: 0,
        interest: null,
        remainingPrincipal: remainingPrincipal,
        totalOwing: totalOwing
    });

    const yearsUntilPaidOff = Math.floor((repaymentsArray.length - 1) / frequency);
    const remainingPeriods = (repaymentsArray.length - 1) % frequency;
    const monthsUntilPaidOff = Math.round(remainingPeriods / (frequency / 12));

    const loopYears = Math.ceil((repaymentsArray.length - 1) / frequency);
    for (let i = 1; i <= loopYears; i++) {
        const start = (i - 1) * frequency + 1;
        const end = i * frequency + 1;
        const yearSlice = repaymentsArray.slice(start, end);
        const annualInterest = yearSlice.reduce(addRepaymentInterest, 0);
        const annualRepayments = repayment * yearSlice.length;
        const principalToDeduct = annualRepayments - annualInterest;

        if (principalToDeduct > remainingPrincipal) {
            remainingPrincipal = 0;
            totalOwing = repaymentType === RepaymentType.PrincipalAndInterest ? 0 : principal;
        } else {
            remainingPrincipal = repaymentType === RepaymentType.PrincipalAndInterest ?
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

    const tableRows = annualPayments.map((row) => (
        <tr key={row.year}>
            <th scope="row">{row.year === 0 ? '' : row.year}</th>
            <td>{row.interest == null ? '' : moneyFormat.format(row.interest)}</td>
            <td>{moneyFormat.format(row.remainingPrincipal)}</td>
            <td>{moneyFormat.format(row.totalOwing)}</td>
        </tr>
    ));

    const chartData: ChartData<'line'> = {
        labels: annualPayments.map(a => a.year.toString(10)),
        datasets: [
          {
            label: 'Owing',
            fill: true,
            tension: 0.1,
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
            tension: 0.1,
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

    const chartOptions: ChartOptions<'line'> = {
        animation: {
            duration: 500
        },
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Year'
                },
                ticks: {
                    callback: function(value: string | number): string {
                        const intValue = typeof value === 'number' ? value : parseInt(value, 10);
                        if (intValue % 5 === 0) {
                            return intValue.toString();
                        } else {
                            return '';
                        }
                    }
                }
            },
            y: {
                min: 0,
                ticks: {
                    callback: function(value: string | number): string {
                        const intValue = typeof value === 'number' ? value : parseInt(value, 10);
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
            }
        },
        plugins: {
            tooltip: {
                mode: 'index',
                callbacks: {
                    title: function(tooltipItems: TooltipItem<'line'>[]): string {
                        return tooltipItems.length > 0 ? 'Year ' + tooltipItems[0].dataIndex : '';
                    },
                    label: function(tooltipItem: TooltipItem<'line'>): string {
                        let label = tooltipItem.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += moneyFormat.format(tooltipItem.raw as number);
                        return label;
                    }
                }
            }
        }
    };

    return (
        <Container>
            <Row>
                <Col sm={{ size: 6, offset: 3 }}>
                <Alert color="info" className="text-center mt-4 mb-3">
                    Repayments: <strong>{moneyFormat.format(repayment)}</strong> {PaymentFrequency[frequency].toLowerCase()}
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
