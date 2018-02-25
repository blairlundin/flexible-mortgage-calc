import * as React from 'react';
import { Mortgage } from '../logic/MortgageCalculator';
import RepaymentAmount from './RepaymentAmount';

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
            principal: 300000,
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
            <div>
                <form>
                    <label>
                        Principal:
                        $<input 
                            type="number" 
                            name="principal" 
                            step="5000"
                            min="5000"
                            max="10000000"
                            value={this.state.principal} 
                            onChange={this.handleChange} 
                        />
                    </label>
                    <label>
                        Loan Term:
                        <input 
                            type="number" 
                            name="loanTerm" 
                            step="1"
                            min="5"
                            max="30"
                            value={this.state.loanTerm} 
                            onChange={this.handleChange} 
                        />
                    </label>
                    <label>
                        Interest Rate:
                        <input 
                            type="number" 
                            name="interestRate" 
                            step="0.05"
                            min="0.1"
                            max="20"
                            value={this.state.interestRate} 
                            onChange={this.handleChange} 
                        />%
                    </label>
                    <div className="radio">
                        <label>
                            <input 
                                type="radio" 
                                name="frequency"
                                value={Mortgage.PaymentFrequency.Weekly}
                                checked={this.state.frequency === Mortgage.PaymentFrequency.Weekly} 
                                onChange={this.handleRadioChange} 
                            />
                            Weekly
                        </label>
                    </div>
                    <div className="radio">
                        <label>
                            <input 
                                type="radio" 
                                name="frequency"
                                value={Mortgage.PaymentFrequency.Fortnightly}
                                checked={this.state.frequency === Mortgage.PaymentFrequency.Fortnightly} 
                                onChange={this.handleRadioChange} 
                            />
                            Fortnightly
                        </label>
                    </div>
                    <div className="radio">
                        <label>
                            <input 
                                type="radio" 
                                name="frequency"
                                value={Mortgage.PaymentFrequency.Monthly}
                                checked={this.state.frequency === Mortgage.PaymentFrequency.Monthly} 
                                onChange={this.handleRadioChange} 
                            />
                            Monthly
                        </label>
                    </div>
                    <div className="radio">
                        <label>
                            <input 
                                type="radio" 
                                name="repaymentType"
                                value={Mortgage.RepaymentType.PrincipalAndInterest}
                                checked={this.state.repaymentType === Mortgage.RepaymentType.PrincipalAndInterest} 
                                onChange={this.handleRadioChange} 
                            />
                            Principal and Interest
                        </label>
                    </div>
                    <div className="radio">
                        <label>
                            <input 
                                type="radio" 
                                name="repaymentType"
                                value={Mortgage.RepaymentType.InterestOnly}
                                checked={this.state.repaymentType === Mortgage.RepaymentType.InterestOnly} 
                                onChange={this.handleRadioChange} 
                            />
                            Interest Only
                        </label>
                    </div>
                </form>
                <RepaymentAmount {...this.state} />
            </div>
        );
    }
}