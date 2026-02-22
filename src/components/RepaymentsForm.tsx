import { ChangeEvent } from 'react';
import {
    Form, FormGroup, Label, FormText,
    Input, InputGroup, InputGroupText,
    ButtonGroup, Button,
    Row, Col
} from 'reactstrap';
import { PaymentFrequency, RepaymentType } from '../logic/MortgageCalculator';
import { useMortgageStore, MortgageFormState } from '../store/mortgageStore';
import RepaymentsTable from './RepaymentsTable';

export default function RepaymentsForm() {
    const { setField, ...formState } = useMortgageStore();

    const handleChangeFloat = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) setField(name as keyof MortgageFormState, parsed);
    };

    const handleChangeInt = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed)) setField(name as keyof MortgageFormState, parsed);
    };

    return (
        <Form>
            <Row className="justify-content-center">
                <Col sm="2" xs="12">
                    <FormGroup>
                        <Label>Principal</Label>
                        <InputGroup>
                            <InputGroupText>$</InputGroupText>
                            <Input
                                type="number"
                                name="principal"
                                step="5000"
                                min="5000"
                                max="10000000"
                                value={formState.principal}
                                onChange={handleChangeInt}
                            />
                        </InputGroup>
                        <FormText>The amount of the loan</FormText>
                    </FormGroup>
                </Col>
                <Col sm="2" xs="12">
                    <FormGroup>
                        <Label>Loan Term</Label>
                        <InputGroup>
                            <Input
                                type="number"
                                name="loanTerm"
                                step="1"
                                min="5"
                                max="30"
                                value={formState.loanTerm}
                                onChange={handleChangeInt}
                            />
                            <InputGroupText>years</InputGroupText>
                        </InputGroup>
                    </FormGroup>
                </Col>
                <Col sm="2" xs="12">
                    <FormGroup>
                        <Label>Interest Rate</Label>
                        <InputGroup>
                            <Input
                                type="number"
                                name="interestRate"
                                step="0.05"
                                min="0.1"
                                max="20"
                                value={formState.interestRate}
                                onChange={handleChangeFloat}
                            />
                            <InputGroupText>%</InputGroupText>
                        </InputGroup>
                    </FormGroup>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col sm={{ size: 'auto' }}>
                    <FormGroup>
                    <ButtonGroup>
                        <Button
                            color="primary"
                            onClick={() => setField('frequency', PaymentFrequency.Weekly)}
                            active={formState.frequency === PaymentFrequency.Weekly}
                        >
                            Weekly
                        </Button>
                        <Button
                            color="primary"
                            onClick={() => setField('frequency', PaymentFrequency.Fortnightly)}
                            active={formState.frequency === PaymentFrequency.Fortnightly}
                        >
                            Fortnightly
                        </Button>
                        <Button
                            color="primary"
                            onClick={() => setField('frequency', PaymentFrequency.Monthly)}
                            active={formState.frequency === PaymentFrequency.Monthly}
                        >
                            Monthly
                        </Button>
                    </ButtonGroup>
                    </FormGroup>
                </Col>
                <Col sm={{ size: 'auto' }}>
                    <FormGroup>
                    <ButtonGroup>
                        <Button
                            color="primary"
                            onClick={() => setField('repaymentType', RepaymentType.PrincipalAndInterest)}
                            active={formState.repaymentType === RepaymentType.PrincipalAndInterest}
                        >
                            Principal and Interest
                        </Button>
                        <Button
                            color="primary"
                            onClick={() => setField('repaymentType', RepaymentType.InterestOnly)}
                            active={formState.repaymentType === RepaymentType.InterestOnly}
                        >
                            Interest Only
                        </Button>
                    </ButtonGroup>
                    </FormGroup>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col sm="2" xs="12">
                    <FormGroup>
                        <Label>Extra Repayment</Label>
                        <InputGroup>
                            <InputGroupText>$</InputGroupText>
                            <Input
                                type="number"
                                name="extraRepayment"
                                step="100"
                                min="0"
                                max="10000"
                                value={formState.extraRepayment}
                                onChange={handleChangeInt}
                                readOnly={formState.repaymentType === RepaymentType.InterestOnly}
                            />
                        </InputGroup>
                        <FormText>The amount extra to pay per repayment</FormText>
                    </FormGroup>
                </Col>
                <Col sm="4" xs="12" />
            </Row>
            <RepaymentsTable {...formState} />
        </Form>
    );
}
