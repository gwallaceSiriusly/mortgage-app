import React, {useState, useEffect} from "react";

import '../node_modules/rsuite/dist/rsuite.min.css';
import './App.scss';
import { pv, pmt } from 'financial'
import { Slider } from 'rsuite';

// Usage
function App() {

  const [principal, setPrincipal] = useState<number>(0);
  const [rate, setRate] = useState<number>(5.75);
  const [term, setTerm] = useState<number>(30);
  const [other, setOther] = useState<number>(0);
  const [pi, setPI] = useState<number>(0);
  const [taxes, setTaxes] = useState<number>(0);
  const [pmi, setPMI] = useState<number>(0);
  const [debts, setDebts] = useState<number>(0);
  const [income, setIncome] = useState<number>(100000);
  const [payment, setPayment] = useState<number>(0);
  const [dti, setDTI] = useState<number>(36);
  const [downpayment, setDownpayment] = useState<number>(0);
  const [aq, setAQ] = useState<number>(0.2); // Affordability Quotient 

  const [fieldsValidation, setFieldsValidation] = useState<string[]>(["hidden","hidden","hidden","hidden","hidden","hidden","hidden","hidden"]);

  function validateIsCurrency(val :string, index :number) {
    const isValid = /(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/.test(val);
    setFieldsValidation(fieldsValidation.map((temp,i) => {
      if(i===index) return (isValid?"hidden":"shown");
      else return temp;
    }));

    return isValid;
  }
  
  function validateIsPercentage(val :string, index :number) {
    const isValid = /^100$|^100.00$|^\d{0,2}(\.\d{1,3})?$/.test(val);
    setFieldsValidation(fieldsValidation.map((temp,i) => {
      if(i===index) return (isValid?"hidden":"shown");
      else return temp;
    }));

    return isValid;
  }

  function validateIsWholeNumber(val :string, index :number) {
    const isValid = /^\d+$/.test(val);
    setFieldsValidation(fieldsValidation.map((temp,i) => {
      if(i===index) return (isValid?"hidden":"shown");
      else return temp;
    }));

    return isValid;
  }

  function toCurrencyString(val :number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val); 
  }

  function toFormattedNumberString(val :number) {
    return new Intl.NumberFormat().format(val); 
  }
  
  useEffect(() => {
    /*
      App logic - The user can change the dti manually to see how affordable properties are
      since we are using debt, income and downpayment to calculate affordability we need a variable 
      to define how affordabile something is. We do this with our affordability quotient which we 
      define as DTI/a constant, which we have set to be 120. 

      The math we produced here is a simplified version of what they are likely going to end up
      wanting. The client however can't give a clear guidline of what they are going to want, so 
      an iterative approach will be required.

      Max payment we are calculating as monthly income minus monthly debts multiplied by AQ

      This is used to define the max Principal using financial tools:
      https://financialjs.netlify.app/

      We use that to work out what the actual payment will be for the loan amount using the same 
      financial package.

      The DTI is controlled by a slider: 
      https://rsuitejs.com/components/slider/ 
    */
    setAQ(dti/120);

    setDebts(pi+taxes+pmi+other);

    // maximum affordable Principal for the DTI:
    const myMaxPayment = ((income/12)-debts)*aq;

    const actualRate = (rate/100)/12;
    const actualTerm = term*12;

    const myPrincipal = pv(actualRate, actualTerm, -myMaxPayment);
    
    setPrincipal(Math.round(myPrincipal * 100)/100);

    // actual payment for Principal minus the downpayment
    const actualPayment = pmt(actualRate, actualTerm, -(myPrincipal-downpayment))

    setPayment(Math.round(actualPayment * 100)/100);
  }, [principal, rate, term, payment, debts, income, other, dti, pi, taxes, pmi, aq, downpayment]);

  return (
    <div className="calculator">
      <div className="inputPanel">
        <ul>
          <li>
            <label htmlFor="income" className={"error " + fieldsValidation[0]}>You need to enter a dollar amount.</label>
            <label htmlFor="income" className="heading">Annual Gross Income ($)</label>
            <input type="tel" name="income" id="income" defaultValue={income} onChange={(ev)=> {
              if (validateIsCurrency(ev.target.value, 0)) {
                setIncome(Number(ev.target.value));
              }
            }}></input>
            <label className="tooltip"> <span className="tooltipText">Enter the total annual income before taxes for you and your co-borrower.</span></label>
          </li>
          <li>
            <label htmlFor="dp" className={"error " + fieldsValidation[7]}>You need to enter a whole number of years.</label>
            <label htmlFor="dp" className="heading">Downpayment</label>
            <input type="tel" name="term" id="dp" defaultValue={downpayment} onChange={(ev)=> {
              if (validateIsCurrency(ev.target.value, 7)) {
                setDownpayment(Number(ev.target.value));
              }
            }}></input>
            <label className="tooltip"> <span className="tooltipText">Select the length of your loan in years.</span></label>
          </li>
          <li>
            <label htmlFor="term" className={"error " + fieldsValidation[2]}>You need to enter a whole number of years.</label>
            <label htmlFor="term" className="heading">Loan Duration (yrs)</label>
            <input type="tel" name="term" id="term" defaultValue={term} onChange={(ev)=> {
              if (validateIsWholeNumber(ev.target.value, 2)) {
                setTerm(Number(ev.target.value));
              }
            }}></input>
            <label className="tooltip"> <span className="tooltipText">Select the length of your loan in years.</span></label>
          </li>
          <li>
            <label htmlFor="pmi" className={"error " + fieldsValidation[6]}>You need to enter a dollar amount.</label>
            <label htmlFor="pmi" className="heading">Total Car Loan/Student Loan Debt ($)</label>
            <input type="tel" name="pmi" id="pmi" defaultValue={pmi} onChange={(ev)=> {
              if (validateIsCurrency(ev.target.value, 6)) {
                setPMI(Number(ev.target.value));
              }
            }}></input>
            <label className="tooltip"> <span className="tooltipText">Enter the total monthly amount of all current car loans or any student loans you pay.</span></label>
          </li>
          <li>
            <label htmlFor="pi" className={"error " + fieldsValidation[4]}>You need to enter a dollar amount.</label>
            <label htmlFor="pi" className="heading">Monthly Instalment Debt ($)</label>
            <input type="tel" name="pi" id="pi" defaultValue={pi} onChange={(ev)=> {
              if (validateIsCurrency(ev.target.value, 4)) {
                setPI(Number(ev.target.value));
              }
            }}></input>
            <label className="tooltip"> <span className="tooltipText">Enter the total amount paid monthly on your credit cards or other installment debts.</span></label>
          </li>
          <li>
            <label htmlFor="other" className={"error " + fieldsValidation[3]}>You need to enter a dollar amount.</label>
            <label htmlFor="other" className="heading">Monthly Other Debt ($)</label>
            <input type="tel" name="other" id="other" defaultValue={other} onChange={(ev)=> {
              if (validateIsCurrency(ev.target.value, 3)) {
                setOther(Number(ev.target.value));
              }
            }}></input>
            <label className="tooltip"> <span className="tooltipText">Enter the total amount of additional monthly debts.</span></label>
          </li>
          <li>
            <label htmlFor="taxes" className={"error " + fieldsValidation[5]}>You need to enter a dollar amount.</label>
            <label htmlFor="taxes" className="heading">Property Taxes ($)</label>
            <input type="tel" name="taxes" id="taxes" defaultValue={taxes} onChange={(ev)=> {
              if (validateIsCurrency(ev.target.value, 5)) {
                setTaxes(Number(ev.target.value));
              }
            }}></input>
            <label className="tooltip"> <span className="tooltipText">Enter the total amount of Property Taxes you will pay.</span></label>
          </li>
          <li>
            <label htmlFor="rate" className={"error " + fieldsValidation[1]}>You need to enter a percentage to 3 decimal places.</label>
            <label htmlFor="rate" className="heading">Interest rate (%)</label>
            <input type="tel" name="rate" id="rate" defaultValue={rate} onChange={(ev)=> {
              if (validateIsPercentage(ev.target.value, 1)) {
                setRate(Number(ev.target.value));
              }
            }}></input>
            <label className="tooltip"> <span className="tooltipText">Your interest rate will vary based on a number of factors including home price, down payment, credit score and even location. Estimate your rate based on current market conditions.</span></label>
          </li>
        </ul>
      </div>
      <div className="resultPanel">
        <div className="affordabilityPanel">
          <p>
            <span className="label">You can afford a home up to: </span><span className="value">{toCurrencyString(principal)}</span>
          </p>
          <p>
            <span className="label">Your monthly payment: </span><span className="value">{toCurrencyString(payment)}</span>
          </p>
          <p>
            <span className="label">Debt to Income ratio: </span><span className="value">{toFormattedNumberString(dti)}%</span>
          </p>
        </div>
        <div className="affordabilitySlider">
          <Slider
            min={10}
            max={50}
            value={dti}
            onChange={(val:number)=>{
              setDTI(val);
            }}
            className="custom-slider"
            handleStyle={{
              borderRadius: 10,
              color: '#fff',
              fontSize: 12,
              width: 32,
              height: 22
            }}
            graduated={false}
            tooltip={false}
          />
          <h3>*Debt-to-Income affects how much you can borrow</h3>
          <p>The debt-to-income ratio (DTI) is your mnimum monthly debt divided by your gross monthly income. The lower your DTI, the more you can borrow and the more options you'll have.</p>

          <ul>
            <li>
              <b>0-36%:</b> Affordable
            </li>
            <li>
              <b>37-42%:</b> Stretching
            </li>
            <li>
              <b>43% or higher:</b> Aggressive
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;