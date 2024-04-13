class BuiltinChipFactory {
    static create(pos, code, rotation) {
        let iPinsData = { "A": { "offset": { "x": -3, "y": -1 } }, "B": { "offset": { "x": -3, "y": 1 } } };
        let oPinsData = { "Out": { "offset": { "x": 3, "y": 0 }, "state": WireState.FLOATING } };

        let chip;
        switch (code) {
            case BuiltinChipCode.AND:
                {
                    chip = new GeneralChip(pos, code, { x: 6, y: 4 }, "AND", color("#8ECAE6"), new TruthTableEvaluation(AND_TRUTH_TABLE), iPinsData, oPinsData);
                    break;
                }
            case BuiltinChipCode.OR:
                {
                    chip = new GeneralChip(pos, code, { x: 6, y: 4 }, "OR", color("#3DED97"), new TruthTableEvaluation(OR_TRUTH_TABLE), iPinsData, oPinsData);
                    break;
                }
            case BuiltinChipCode.XOR:
                {
                    chip = new GeneralChip(pos, code, { x: 6, y: 4 }, "XOR", color("#FFD907"), new TruthTableEvaluation(XOR_TRUTH_TABLE), iPinsData, oPinsData);
                    break;
                }
            case BuiltinChipCode.NAND:
                {
                    chip = new GeneralChip(pos, code, { x: 6, y: 4 }, "NAND", color("#219EBC"), new TruthTableEvaluation(NAND_TRUTH_TABLE), iPinsData, oPinsData);
                    break;
                }
            case BuiltinChipCode.NOR:
                {
                    chip = new GeneralChip(pos, code, { x: 6, y: 4 }, "NOR", color("#29A065"), new TruthTableEvaluation(NOR_TRUTH_TABLE), iPinsData, oPinsData);
                    break;
                }
            case BuiltinChipCode.XNOR:
                {
                    chip = new GeneralChip(pos, code, { x: 6, y: 4 }, "XNOR", color("#FFB703"), new TruthTableEvaluation(XNOR_TRUTH_TABLE), iPinsData, oPinsData);
                    break;
                }
            case BuiltinChipCode.NOT:
                {
                    chip = new GeneralChip(pos, code, { x: 4, y: 2 }, "NOT", color("#C21807"), new TruthTableEvaluation(NOT_TRUTH_TABLE), { "A": { "offset": { "x": -2, "y": 0 } } }, { "Out": { "offset": { "x": 2, "y": 0 }, "state": WireState.FLOATING } });
                    break;
                }
            case BuiltinChipCode.CONST:
                {
                    chip = new ConstChip(pos);
                    break;
                }
            case BuiltinChipCode.INPUT:
                {
                    chip = new InputChip(pos);
                    break;
                }
            case BuiltinChipCode.OUTPUT:
                {
                    chip = new OutputChip(pos);
                    break;
                }
            case BuiltinChipCode.SEVEN_SEGMENT_DISPLAY:
                {
                    chip = new SevenSegmentDisplay(pos);
                    break;
                }
        }

        for (let i = 0; i < rotation; i++) chip.rotate();
        return chip;
    }
}

class CustomChipFactory {
    static create(pos, data) {
        let circuit = new Circuit();
        circuit.load(data.circuit);
        return new GeneralChip(pos, "CUSTOM", data.size, data.name, color("#FFFFFF"), new InnerCircuitEvaluation(circuit), data.iPinsData, data.oPinsData);
    }
}