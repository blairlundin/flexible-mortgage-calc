import { useState } from 'react';
import { PaymentFrequency, RepaymentType, computeAmortization } from '../logic/MortgageCalculator';
import type { OffsetEntry } from '../logic/MortgageCalculator';
import { Alert, Table, Collapse } from 'reactstrap';
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

const moneyFormat = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

interface RepaymentsTableProps {
    principal: number;
    extraRepayment: number;
    loanTerm: number;
    interestRate: number;
    frequency: PaymentFrequency;
    repaymentType: RepaymentType;
    offsetEnabled: boolean;
    offsetEntries: OffsetEntry[];
}

function padSeries(data: number[], targetLength: number): number[] {
    const result = [...data];
    while (result.length < targetLength) result.push(0);
    return result;
}

function formatYearsMonths(years: number, months: number): string {
    if (years === 0) return `${months} months`;
    if (months === 0) return `${years} years`;
    return `${years} years ${months} months`;
}

export default function RepaymentsTable({
    principal, extraRepayment, loanTerm, interestRate, frequency, repaymentType,
    offsetEnabled, offsetEntries,
}: RepaymentsTableProps) {
    const [scheduleOpen, setScheduleOpen] = useState(false);

    const baseResult = computeAmortization(
        principal, loanTerm, interestRate, frequency, repaymentType, extraRepayment
    );

    const offsetResult = offsetEnabled && offsetEntries.length > 0
        ? computeAmortization(
            principal, loanTerm, interestRate, frequency, repaymentType, extraRepayment, offsetEntries
        )
        : null;

    // Chart data
    const maxLabels = Math.max(
        baseResult.annualPayments.length,
        offsetResult ? offsetResult.annualPayments.length : 0
    );
    const chartLabels = Array.from({ length: maxLabels }, (_, i) => i.toString());

    const baseOwingData = padSeries(
        baseResult.annualPayments.map(a => parseFloat(a.totalOwing.toFixed(2))),
        maxLabels
    );
    const basePrincipalData = padSeries(
        baseResult.annualPayments.map(a => parseFloat(a.remainingPrincipal.toFixed(2))),
        maxLabels
    );

    const datasets: ChartData<'line'>['datasets'] = [
        {
            label: 'Owing',
            fill: true,
            tension: 0.1,
            backgroundColor: 'rgba(70,130,180,0.35)',
            borderColor: 'rgba(55,110,165,1)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(55,110,165,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(55,110,165,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 3,
            pointHitRadius: 10,
            data: baseOwingData,
        },
        {
            label: 'Principal',
            fill: true,
            tension: 0.1,
            backgroundColor: 'rgba(70,130,180,0.7)',
            borderColor: 'rgba(55,110,165,1)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(55,110,165,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(55,110,165,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 3,
            pointHitRadius: 10,
            data: basePrincipalData,
        },
    ];

    if (offsetResult) {
        const offsetOwingData = padSeries(
            offsetResult.annualPayments.map(a => parseFloat(a.totalOwing.toFixed(2))),
            maxLabels
        );
        const offsetPrincipalData = padSeries(
            offsetResult.annualPayments.map(a => parseFloat(a.remainingPrincipal.toFixed(2))),
            maxLabels
        );

        datasets.push({
            label: 'Owing (offset)',
            fill: true,
            tension: 0.1,
            backgroundColor: 'rgba(80,200,120,0.35)',
            borderColor: 'rgba(40,160,80,1)',
            borderCapStyle: 'butt',
            borderDash: [6, 3],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(40,160,80,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(40,160,80,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 3,
            pointHitRadius: 10,
            data: offsetOwingData,
        });

        datasets.push({
            label: 'Principal (offset)',
            fill: true,
            tension: 0.1,
            backgroundColor: 'rgba(80,200,120,0.7)',
            borderColor: 'rgba(40,160,80,1)',
            borderCapStyle: 'butt',
            borderDash: [6, 3],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(40,160,80,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(40,160,80,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 3,
            pointHitRadius: 10,
            data: offsetPrincipalData,
        });
    }

    const chartData: ChartData<'line'> = { labels: chartLabels, datasets };

    const chartOptions: ChartOptions<'line'> = {
        animation: { duration: 500 },
        responsive: true,
        scales: {
            x: {
                title: { display: true, text: 'Year' },
                ticks: {
                    callback: function (value: string | number): string {
                        const intValue = typeof value === 'number' ? value : parseInt(value, 10);
                        return intValue % 5 === 0 ? intValue.toString() : '';
                    },
                },
            },
            y: {
                min: 0,
                ticks: {
                    callback: function (value: string | number): string {
                        const intValue = typeof value === 'number' ? value : parseInt(value, 10);
                        if (intValue === 0) return '$0';
                        if (intValue % 100000 === 0) {
                            return intValue >= 1000000
                                ? '$' + intValue / 1000000 + 'M'
                                : '$' + intValue / 1000 + 'k';
                        }
                        return '';
                    },
                },
            },
        },
        plugins: {
            tooltip: {
                mode: 'index',
                callbacks: {
                    title: function (tooltipItems: TooltipItem<'line'>[]): string {
                        return tooltipItems.length > 0 ? 'Year ' + tooltipItems[0].dataIndex : '';
                    },
                    label: function (tooltipItem: TooltipItem<'line'>): string {
                        let label = tooltipItem.dataset.label || '';
                        if (label) label += ': ';
                        label += moneyFormat.format(tooltipItem.raw as number);
                        return label;
                    },
                },
            },
        },
    };

    // Savings summary
    let interestSaved = 0;
    let savedYears = 0;
    let savedMonths = 0;
    if (offsetResult) {
        interestSaved = baseResult.totalInterest - offsetResult.totalInterest;
        const baseMonths = baseResult.yearsUntilPaidOff * 12 + baseResult.monthsUntilPaidOff;
        const offsetMonths = offsetResult.yearsUntilPaidOff * 12 + offsetResult.monthsUntilPaidOff;
        const totalSavedMonths = Math.max(0, baseMonths - offsetMonths);
        savedYears = Math.floor(totalSavedMonths / 12);
        savedMonths = totalSavedMonths % 12;
    }

    // Table rows
    const tableLength = Math.max(
        baseResult.annualPayments.length,
        offsetResult ? offsetResult.annualPayments.length : 0
    );
    const tableRows = Array.from({ length: tableLength }, (_, i) => {
        const baseRow = baseResult.annualPayments[i];
        const offsetRow = offsetResult?.annualPayments[i];
        return (
            <tr key={i}>
                <th scope="row">{i === 0 ? '' : i}</th>
                <td>{baseRow?.interest == null ? '' : moneyFormat.format(baseRow.interest)}</td>
                <td>{baseRow ? moneyFormat.format(baseRow.remainingPrincipal) : ''}</td>
                <td>{baseRow ? moneyFormat.format(baseRow.totalOwing) : ''}</td>
                {offsetResult && (
                    <>
                        <td>{offsetRow == null || offsetRow.interest == null ? '' : moneyFormat.format(offsetRow.interest)}</td>
                        <td>{offsetRow ? moneyFormat.format(offsetRow.remainingPrincipal) : ''}</td>
                        <td>{offsetRow ? moneyFormat.format(offsetRow.totalOwing) : ''}</td>
                    </>
                )}
            </tr>
        );
    });

    return (
        <Container>
            <Row>
                <Col sm={{ size: 6, offset: 3 }}>
                    <Alert color="info" className="text-center mt-4 mb-3">
                        Repayments: <strong>{moneyFormat.format(baseResult.repaymentAmount)}</strong>{' '}
                        {PaymentFrequency[frequency].toLowerCase()}
                        {offsetResult ? (
                            <>
                                <Row className="mt-2 text-start">
                                    <Col>
                                        <strong>Without offset</strong>
                                        <p className="mb-0">
                                            Total interest: <strong>{moneyFormat.format(baseResult.totalInterest)}</strong>
                                        </p>
                                        <p className="mb-0">
                                            Paid off in: <strong>{formatYearsMonths(baseResult.yearsUntilPaidOff, baseResult.monthsUntilPaidOff)}</strong>
                                        </p>
                                    </Col>
                                    <Col>
                                        <strong>With offset</strong>
                                        <p className="mb-0">
                                            Total interest: <strong>{moneyFormat.format(offsetResult.totalInterest)}</strong>
                                        </p>
                                        <p className="mb-0">
                                            Paid off in: <strong>{formatYearsMonths(offsetResult.yearsUntilPaidOff, offsetResult.monthsUntilPaidOff)}</strong>
                                        </p>
                                    </Col>
                                </Row>
                                <p className="mb-0 mt-2">
                                    You save{' '}
                                    <strong>{moneyFormat.format(interestSaved)}</strong> in interest
                                    {(savedYears > 0 || savedMonths > 0) && (
                                        <> and <strong>{formatYearsMonths(savedYears, savedMonths)}</strong></>
                                    )}
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="mb-0">
                                    Total interest payable: <strong>{moneyFormat.format(baseResult.totalInterest)}</strong>
                                </p>
                                <p>
                                    Time until paid off:{' '}
                                    <strong>{formatYearsMonths(baseResult.yearsUntilPaidOff, baseResult.monthsUntilPaidOff)}</strong>
                                </p>
                            </>
                        )}
                    </Alert>
                </Col>
            </Row>

            <Row>
                <Col sm={{ size: 8, offset: 2 }}>
                    <Line data={chartData} options={chartOptions} />
                    <button
                        type="button"
                        onClick={() => setScheduleOpen(o => !o)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            marginTop: '2rem',
                            padding: '0.75rem 1rem',
                            background: 'none',
                            border: '1px solid #dee2e6',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#495057',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                        }}
                    >
                        <span>Full repayment schedule</span>
                        <span style={{
                            display: 'inline-block',
                            transition: 'transform 0.2s ease',
                            transform: scheduleOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            fontSize: '0.75rem',
                            color: '#868e96',
                        }}>▼</span>
                    </button>
                    <Collapse isOpen={scheduleOpen}>
                        <Table className="table-sm mt-3">
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>Interest</th>
                                    <th>Principal</th>
                                    <th>Owing</th>
                                    {offsetResult && (
                                        <>
                                            <th>Interest (offset)</th>
                                            <th>Principal (offset)</th>
                                            <th>Owing (offset)</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {tableRows}
                            </tbody>
                        </Table>
                    </Collapse>
                </Col>
            </Row>
        </Container>
    );
}
