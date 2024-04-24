/*
    Logic Circuit Simulator
    Copyright (C) 2024 Mórocz Barnabás

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

class TruthTable {
    constructor(inputs, outputs, data) {
        this.inputs = inputs;
        this.outputs = outputs;
        this.data = {};

        for (let i = 0; i < data.length; i++) {
            this.data[data[i][0].join("")] = data[i][1];
            if (data[i][2]) this.data[data[i][0].reverse().join('')] = data[i][1];
        }
    }

    getOutputState(values) {
        return Object.assign(...this.outputs.map((key, index) => ({ [key]: this.data[this.inputs.map(i => values[i]).join("")][index] })));
    }
}

function invertData(data) {
    function applyNot(state) {
        if (state == WireState.ON) return WireState.OFF;
        if (state == WireState.OFF) return WireState.ON;
        return state;
    }

    return data.map(d => [d[0], d[1].map(v => applyNot(v)), d[2]]);
}

const AND_TRUTH_TABLE_DATA = [
    [[WireState.FLOATING, WireState.FLOATING], [WireState.FLOATING], false],
    [[WireState.FLOATING, WireState.ON], [WireState.FLOATING], true],
    [[WireState.FLOATING, WireState.OFF], [WireState.OFF], true],
    [[WireState.FLOATING, WireState.ERROR], [WireState.ERROR], true],
    [[WireState.ON, WireState.ON], [WireState.ON], false],
    [[WireState.ON, WireState.OFF], [WireState.OFF], true],
    [[WireState.ON, WireState.ERROR], [WireState.ERROR], true],
    [[WireState.OFF, WireState.OFF], [WireState.OFF], false],
    [[WireState.OFF, WireState.ERROR], [WireState.OFF], true],
    [[WireState.ERROR, WireState.ERROR], [WireState.ERROR], false],
];

const NAND_TRUTH_TABLE_DATA = invertData(AND_TRUTH_TABLE_DATA);

const AND_TRUTH_TABLE = new TruthTable(["A", "B"], ["Out"], AND_TRUTH_TABLE_DATA);
const NAND_TRUTH_TABLE = new TruthTable(["A", "B"], ["Out"], NAND_TRUTH_TABLE_DATA);

const OR_TRUTH_TABLE_DATA = [
    [[WireState.FLOATING, WireState.FLOATING], [WireState.FLOATING], false],
    [[WireState.FLOATING, WireState.ON], [WireState.ON], true],
    [[WireState.FLOATING, WireState.OFF], [WireState.FLOATING], true],
    [[WireState.FLOATING, WireState.ERROR], [WireState.ERROR], true],
    [[WireState.ON, WireState.ON], [WireState.ON], false],
    [[WireState.ON, WireState.OFF], [WireState.ON], true],
    [[WireState.ON, WireState.ERROR], [WireState.ON], true],
    [[WireState.OFF, WireState.OFF], [WireState.OFF], false],
    [[WireState.OFF, WireState.ERROR], [WireState.ERROR], true],
    [[WireState.ERROR, WireState.ERROR], [WireState.ERROR], false],
];

const NOR_TRUTH_TABLE_DATA = invertData(OR_TRUTH_TABLE_DATA);

const OR_TRUTH_TABLE = new TruthTable(["A", "B"], ["Out"], OR_TRUTH_TABLE_DATA);
const NOR_TRUTH_TABLE = new TruthTable(["A", "B"], ["Out"], NOR_TRUTH_TABLE_DATA);

const XOR_TRUTH_TABLE_DATA = [
    [[WireState.FLOATING, WireState.FLOATING], [WireState.FLOATING], false],
    [[WireState.FLOATING, WireState.ON], [WireState.FLOATING], true],
    [[WireState.FLOATING, WireState.OFF], [WireState.FLOATING], true],
    [[WireState.FLOATING, WireState.ERROR], [WireState.ERROR], true],
    [[WireState.ON, WireState.ON], [WireState.OFF], false],
    [[WireState.ON, WireState.OFF], [WireState.ON], true],
    [[WireState.ON, WireState.ERROR], [WireState.ON], true],
    [[WireState.OFF, WireState.OFF], [WireState.OFF], false],
    [[WireState.OFF, WireState.ERROR], [WireState.ERROR], true],
    [[WireState.ERROR, WireState.ERROR], [WireState.ERROR], false],
];

const XNOR_TRUTH_TABLE_DATA = invertData(XOR_TRUTH_TABLE_DATA);

const XOR_TRUTH_TABLE = new TruthTable(["A", "B"], ["Out"], XOR_TRUTH_TABLE_DATA);
const XNOR_TRUTH_TABLE = new TruthTable(["A", "B"], ["Out"], XNOR_TRUTH_TABLE_DATA);

const NOT_TRUTH_TABLE_DATA = [
    [[WireState.FLOATING], [WireState.FLOATING], false],
    [[WireState.ON], [WireState.OFF], false],
    [[WireState.OFF], [WireState.ON], false],
    [[WireState.ERROR], [WireState.ERROR], false],
];

const NOT_TRUTH_TABLE = new TruthTable(["A"], ["Out"], NOT_TRUTH_TABLE_DATA);

class TruthTableEvaluation {
    constructor(table) {
        this.table = table;
    }

    evaluate(input) {
        return this.table.getOutputState(input);
    }
}

class InnerCircuitEvaluation {
    constructor(circuit) {
        this.circuit = circuit;
    }

    evaluate(input) {
        this.circuit.chips.filter(ch => ch.code == BuiltinChipCode.INPUT).forEach(ch => ch.oPins["Out"].setState(input[ch.name]));
        Circuit.evaluate(this.circuit.chips.filter(ch => ch.code == BuiltinChipCode.INPUT));

        let result = {};
        for (const chip of this.circuit.chips.filter(ch => ch.code == BuiltinChipCode.OUTPUT)) result[chip.name] = chip.getInputState("In");

        return result;
    }
}