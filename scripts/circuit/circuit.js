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

class BuiltinChipCode {
    static AND = "AND";
    static OR = "OR";
    static XOR = "XOR";
    static NAND = "NAND";
    static NOR = "NOR";
    static XNOR = "XNOR";
    static NOT = "NOT";
    static CONST = "CONST";
    static INPUT = "INPUT";
    static OUTPUT = "OUTPUT";
    static SEVEN_SEGMENT_DISPLAY = "SEVEN_SEGMENT_DISPLAY";
}

class Circuit {
    constructor() {
        this.chips = [];
        this.wires = [];
    }

    addBuiltinChip(pos, code, rotation = 0) {
        let chip = BuiltinChipFactory.create(pos, code, rotation);
        for (const pin of [...Object.values(chip.iPins), ...Object.values(chip.oPins)]) this.wires.push(pin.wire);
        this.chips.push(chip);
    }

    addCustomChip(data) {
        let chip = CustomChipFactory.create(Viewport.getScreenCenterGlobalPos(), data);
        for (const pin of [...Object.values(chip.iPins), ...Object.values(chip.oPins)]) this.wires.push(pin.wire);
        this.chips.push(chip);
    }

    static evaluate(chips) {
        let chipQueue = [...chips];
        let visitedChips = [];

        while (chipQueue.length != 0) {
            let chip = chipQueue.shift();

            if (chip.visitCount == 0) visitedChips.push(chip);
            chip.evaluate();

            chip.visitCount++;
            if (chip.visitCount > 1000) chip.setOutputs(WireState.ERROR);

            for (const pin of Object.values(chip.oPins)) {
                let oldState = pin.wire.state;
                pin.wire.state = WiringTool.combineWireStates(pin.wire.getSrcPins().map(p => p.getState()));
                if (pin.wire.state == oldState) continue;

                chipQueue.push(...(pin.wire.getDstChips().sort(() => 0.5 - Math.random())));
            }
        }

        for (const chip of visitedChips) chip.visitCount = 0;
    }

    getAllChipRecursively() {
        return [...this.chips, ...this.chips.filter(ch => ch.code === "CUSTOM").flatMap(ch => ch.evaluation.circuit.getAllChipRecursively())];
    }

    getAllWireRecursively() {
        return [...this.wires, ...this.chips.filter(ch => ch.code === "CUSTOM").flatMap(ch => ch.evaluation.circuit.getAllWireRecursively())];
    }

    reset() {
        this.getAllChipRecursively().filter(ch => ch.code != BuiltinChipCode.CONST).forEach(ch => ch.setOutputs(WireState.FLOATING));
        this.getAllWireRecursively().forEach(w => w.state = WireState.FLOATING);

        function resetEvaluate(circuit) {
            circuit.chips.filter(ch => ch.code == "CUSTOM").forEach(ch => resetEvaluate(ch.evaluation.circuit));
            Circuit.evaluate(circuit.chips.filter(ch => ch.code == "CUSTOM" || ch.code == BuiltinChipCode.CONST));
        }

        resetEvaluate(this);
    }

    toJSON() {
        let offsetX = (Math.round(((Math.min(...this.chips.map(ch => ch.pos.x)) + Math.max(...this.chips.map(ch => ch.pos.x))) / 2) / GRID_SIZE)) * GRID_SIZE;
        let offsetY = (Math.round(((Math.min(...this.chips.map(ch => ch.pos.y)) + Math.max(...this.chips.map(ch => ch.pos.y))) / 2) / GRID_SIZE)) * GRID_SIZE;

        let data = { "chips": [], "wires": [] };

        for (const chip of this.chips) {
            switch (chip.code) {
                case "CUSTOM":
                    {
                        let iPinsData = Object.assign({}, ...Object.keys(chip.iPins).map(key => { return { [key]: { "offset": chip.iPins[key].offset } } }));
                        let oPinsData = Object.assign({}, ...Object.keys(chip.oPins).map(key => { return { [key]: { "offset": chip.oPins[key].offset, "state": chip.oPins[key].state } } }));

                        data["chips"].push({ "code": chip.code, "pos": { x: chip.pos.x - offsetX, y: chip.pos.y - offsetY }, "output": { ...chip.output }, "data": { "size": chip.size, "name": chip.name, "circuit": chip.evaluation.circuit.toJSON(), "iPinsData": iPinsData, "oPinsData": oPinsData } });
                        break;
                    }
                default:
                    {
                        data["chips"].push({ "code": chip.code, "name": chip.name, "pos": { x: chip.pos.x - offsetX, y: chip.pos.y - offsetY }, "rotation": chip.rotation });
                        break;
                    }
            }
        }

        for (const wire of this.wires) {
            let wirePoints = [];
            let connections = [];

            for (const wirePoint of wire.points) {
                if (wirePoint instanceof InputPin) {
                    wirePoints.push({ "type": WirePoint.INPUT_PIN, "chipIndex": this.chips.indexOf(wirePoint.chip), "name": wirePoint.name });
                    continue;
                }

                if (wirePoint instanceof OutputPin) {
                    wirePoints.push({ "type": WirePoint.OUTPUT_PIN, "chipIndex": this.chips.indexOf(wirePoint.chip), "name": wirePoint.name, "state": wirePoint.getState() });
                    continue;
                }

                if (wirePoint instanceof NonPin) {
                    wirePoints.push({ "type": WirePoint.NON_PIN, "pos": { x: wirePoint.pos.x - offsetX, y: wirePoint.pos.y - offsetY } });
                    continue;
                }
            }

            for (const wirePoint of wire.points) {
                for (const neighbour of wirePoint.neighbours) connections.push(wire.points.indexOf(wirePoint).toString() + "-" + wire.points.indexOf(neighbour).toString());
            }

            data["wires"].push({ "state": wire.state, "points": wirePoints, "connections": connections });
        }

        return data;
    }

    load(data) {
        this.chips = [];
        this.wires = [];

        for (const dataChip of data.chips) {
            switch (dataChip.code) {
                case "CUSTOM":
                    {
                        let chip = CustomChipFactory.create(dataChip.pos, dataChip.data);
                        this.chips.push(chip);
                        break;
                    }
                default:
                    {
                        let chip = BuiltinChipFactory.create(dataChip.pos, dataChip.code, dataChip.rotation);
                        chip.name = dataChip.name;
                        this.chips.push(chip);
                        break;
                    }
            }
        }

        for (const dataWire of data.wires) {
            let wire = new Wire();
            wire.state = dataWire.state;

            for (const wirePoint of dataWire.points) {
                switch (wirePoint.type) {
                    case WirePoint.INPUT_PIN:
                        {
                            let pin = this.chips[wirePoint.chipIndex].iPins[wirePoint.name];
                            pin.wire = wire;
                            wire.points.push(pin);
                            break;
                        }
                    case WirePoint.OUTPUT_PIN:
                        {
                            let pin = this.chips[wirePoint.chipIndex].oPins[wirePoint.name];
                            pin.wire = wire;
                            pin.setState(wirePoint.state);
                            wire.points.push(pin);
                            break;
                        }
                    case WirePoint.NON_PIN:
                        {
                            new NonPin(wirePoint.pos, wire);
                            break;
                        }
                }
            }

            for (const connection of dataWire.connections) {
                let [src, dst] = connection.split("-").map(value => parseInt(value));
                wire.points[src].connect(wire.points[dst]);
            }

            this.wires.push(wire);
        }
    }

    saveAsCircuit() {
        let writer = createWriter("my_circuit.circuit");
        writer.write(JSON.stringify(this.toJSON()));
        writer.close();
    }

    update() {
        for (const wire of this.wires) wire.update();

        loop: for (const chip of this.chips) {
            for (const pin of [...Object.values(chip.iPins), ...Object.values(chip.oPins)]) if (pin.isMouseOver()) {
                for (const ch of mainCircuit.chips.slice().reverse()) if (ch.isMouseOver() && ch != pin.chip) break loop;

                this.chips.splice(this.chips.indexOf(chip), 1);
                this.chips.push(chip);
                break loop;
            }
        }

        for (const chip of this.chips) chip.update();
    }
}