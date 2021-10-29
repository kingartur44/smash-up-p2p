import ohm from 'ohm-js';
import { useState } from 'react';

const arithmetc = ohm.grammar(`
	Arithmetic {
		Exp = AddExp

		AddExp = AddExp "+" MulExp  -- plus
			| AddExp "-" MulExp  -- minus
			| MulExp

		MulExp = MulExp "*" number  -- times
			| MulExp "/" number  -- div
			| number

		number = digit+
	}
`);

const semantics = arithmetc.createSemantics().addOperation('eval', {
	AddExp_plus(a, _, b) {
			return a.eval() + b.eval();    
	},
	AddExp_minus(a, _, b) {
		return a.eval() - b.eval();
	},
	MulExp_times(a, _, b) {
		return a.eval() * b.eval();
	},
	MulExp_div(a, _, b) {
		return a.eval() / b.eval();
	},
	number(digits) {
		return parseInt(digits.sourceString)
	}
});

export const AppTest = () => {

	const [expression, setExpression] = useState("")

	const match = arithmetc.match(expression)

	const result = (() => {
		if (match.succeeded()) {
			return semantics(match).eval();  // Evaluate the expression.
		} else {
			return match.message;  // Extract the error message.
		}
	})()
	

	return <div>
		<textarea value={expression} onChange={e => setExpression(e.target.value)} />
		<div>{JSON.stringify(match.succeeded())}</div>
		<div>{JSON.stringify(result)}</div>
	</div>
}