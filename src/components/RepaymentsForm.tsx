import * as React from 'react';
import { 
    Form, FormGroup, Label, FormText, 
    Input, InputGroup, InputGroupAddon, 
    ButtonGroup, Button,
    Row, Col 
} from 'reactstrap';
import { Mortgage } from '../logic/MortgageCalculator';
import RepaymentAmount from './RepaymentAmount';
import RepaymentsTable from './RepaymentsTable';

// interface RepaymentsFormState {
//     principal: number;
//     loanTerm: number;
//     interestRate: number;
//     frequency: Mortgage.PaymentFrequency;
//     repaymentType: Mortgage.RepaymentType;
//     repaymentAmount: number;
// }

export default class RepaymentsForm extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = { 
            principal: 280000,
            loanTerm: 30,
            interestRate: 4,
            frequency: Mortgage.PaymentFrequency.Monthly,
            repaymentType: Mortgage.RepaymentType.PrincipalAndInterest
         };

        this.handleChange = this.handleChange.bind(this);
        this.handleRadioChange = this.handleRadioChange.bind(this);
    }

    handleChange(event: any) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({ [name]: value });
    }

    handleRadioChange(event: any) {
        let name = event.target.name;
        let value = event.target.value;
        let intValue = parseInt(value, 10);
        this.setState({ [name]: intValue });
    }

    render() {
        return (
            <Form>
                <Row className="justify-content-center">
                    <Col sm="2" xs="12">
                        <FormGroup>
                            <Label>Principal</Label>
                            <InputGroup>
                                <InputGroupAddon addonType="prepend">$</InputGroupAddon>
                                <Input 
                                    type="number" 
                                    name="principal" 
                                    step="5000"
                                    min="5000"
                                    max="10000000"
                                    value={this.state.principal} 
                                    onChange={this.handleChange} 
                                    
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
                                    value={this.state.loanTerm} 
                                    onChange={this.handleChange} 
                                />
                                <InputGroupAddon addonType="append">years</InputGroupAddon>
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
                                    value={this.state.interestRate} 
                                    onChange={this.handleChange}
                                />
                                <InputGroupAddon addonType="append">%</InputGroupAddon>
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
                                onClick={() => this.setState({ frequency: Mortgage.PaymentFrequency.Weekly })} 
                                active={this.state.frequency === Mortgage.PaymentFrequency.Weekly}
                            >
                                Weekly
                            </Button>
                            <Button
                                color="primary" 
                                onClick={() => this.setState({ frequency: Mortgage.PaymentFrequency.Fortnightly })} 
                                active={this.state.frequency === Mortgage.PaymentFrequency.Fortnightly}
                            >
                                Fortnightly
                            </Button>
                            <Button
                                color="primary" 
                                onClick={() => this.setState({ frequency: Mortgage.PaymentFrequency.Monthly })} 
                                active={this.state.frequency === Mortgage.PaymentFrequency.Monthly}
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
                                onClick={() => this.setState({ repaymentType: Mortgage.RepaymentType.PrincipalAndInterest })} 
                                active={this.state.repaymentType === Mortgage.RepaymentType.PrincipalAndInterest}
                            >
                                Principal and Interest
                            </Button>
                            <Button
                                color="primary" 
                                onClick={() => this.setState({ repaymentType: Mortgage.RepaymentType.InterestOnly })} 
                                active={this.state.repaymentType === Mortgage.RepaymentType.InterestOnly}
                            >
                                Interest Only
                            </Button>
                        </ButtonGroup>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col sm={{ size: 8, offset: 2 }}>
                        <RepaymentAmount {...this.state} />
                    </Col>
                </Row>
                <Row>
                    <Col sm={{ size: 8, offset: 2 }}>
                        <RepaymentsTable {...this.state} />
                    </Col>
                </Row>
            </Form>
        );
    }
}