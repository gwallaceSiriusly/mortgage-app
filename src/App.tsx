import React, {useState, useEffect} from "react";

import '../node_modules/rsuite/dist/rsuite.min.css';
import './App.scss';
import { pv } from 'financial'
import { Slider } from 'rsuite';

// Usage
function App() {

  const [principal, setPrincipal] = useState<number>(0);
  const [rate, setRate] = useState<number>(5.75);
  const [term, setTerm] = useState<number>(30);
  const [other, setOther] = useState<number>(500);
  const [pi, setPI] = useState<number>(1167.15);
  const [taxes, setTaxes] = useState<number>(166.67);
  const [pmi, setPMI] = useState<number>(250.00);
  const [debts, setDebts] = useState<number>(0);
  const [income, setIncome] = useState<number>(100000);
  const [payment, setPayment] = useState<number>(0);
  const [dti, setDTI] = useState<number>(36);

  const maxAffordability = 0.20;
  //const maxdti = useState<number>(36);

  const [fieldsValidation, setFieldsValidation] = useState<string[]>(["hidden","hidden","hidden","hidden","hidden","hidden","hidden"]);

  function validateIsCurrency(val :string, index :number) {
    const isValid = /(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/.test(val);
    setFieldsValidation(fieldsValidation.map((temp,i) => {
      if(i===index) return (isValid?"hidden":"shown");
      else return temp;
    }));

    return isValid;
  }
  
  function validateIsPercentage(val :string, index :number) {
    const isValid = /^100$|^100.00$|^\d{0,2}(\.\d{1,2})?$/.test(val);
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

    const myPayment = (income/12)*maxAffordability;

    setPayment(Math.round(myPayment * 100)/100);

    const actualRate = (rate/100)/12;
    const actualTerm = term*12;

    const myPrincipal = pv(actualRate, actualTerm, -myPayment);
    
    setPrincipal(Math.round(myPrincipal * 100)/100);

    setDebts(pi+taxes+pmi);
    const myDTI =  (debts+payment+other)/(income/12);

    setDTI(Math.round(myDTI*10000)/100);
  }, [principal, rate, term, payment, debts, income, other, dti, pi, taxes, pmi]);

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
            <label htmlFor="rate" className={"error " + fieldsValidation[1]}>You need to enter a percentage to 2 decimal places.</label>
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
            min={25}
            max={50}
            value={dti}
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