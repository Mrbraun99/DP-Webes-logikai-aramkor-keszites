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

const StateHandler = {
    states: {},
    activeState: null,

    init: function () {
        this.states["DEFAULT"] = {
            activate: function () {
                document.getElementById("DEFAULT").style.display = "block";
            },

            deactivate: function () {
                document.getElementById("DEFAULT").style.display = "none";
            },

            mouseWheelUp: function () {
                Viewport.applyZoom(1.05);
            },

            mouseWheelDown: function () {
                Viewport.applyZoom(0.95);
            },

            mousePressedRight: function () {
                let wireSegment;
                if ((wireSegment = WiringTool.getAllWireSegment(Viewport.getGlobalMousePos())) != null) {
                    wireSegment.point0.neighbours = wireSegment.point0.neighbours.filter(p => p != wireSegment.point1);
                    wireSegment.point1.neighbours = wireSegment.point1.neighbours.filter(p => p != wireSegment.point0);

                    if (WiringTool.sameWire(wireSegment.point0, wireSegment.point1)) {
                        mainCircuit.wires.forEach(w => w.optimizeStructure());
                        return;
                    }

                    wireSegment.point0.wire.points = [];
                    mainCircuit.wires = mainCircuit.wires.filter(w => w.points.length > 0);

                    let newWire;
                    newWire = new Wire();
                    mainCircuit.wires.push(newWire);
                    newWire.points = wireSegment.point0.getAllConnectedPoint();
                    for (const point of newWire.points) point.wire = newWire;
                    newWire.state = WiringTool.combineWireStates(newWire.getSrcPins().map(p => p.getState()));
                    Circuit.evaluate(newWire.getDstChips());

                    newWire = new Wire();
                    mainCircuit.wires.push(newWire);
                    newWire.points = wireSegment.point1.getAllConnectedPoint();
                    for (const point of newWire.points) point.wire = newWire;
                    newWire.state = WiringTool.combineWireStates(newWire.getSrcPins().map(p => p.getState()));
                    Circuit.evaluate(newWire.getDstChips());
                }

                mainCircuit.wires = mainCircuit.wires.filter(w => !(w.points.length == 1 && w.points[0] instanceof NonPin));
                mainCircuit.wires.forEach(w => w.optimizeStructure());
            },

            mousePressedRightShift: function () {
                let wireSegment;
                if ((wireSegment = WiringTool.getAllWireSegment(Viewport.getGlobalMousePos())) != null) {
                    let wire = wireSegment["point0"].wire;
                    let srcPins = wireSegment["point0"].wire.getSrcPins();
                    let dstPins = wireSegment["point0"].wire.getDstPins();
                    let dstChips = wireSegment["point0"].wire.getDstChips();

                    for (const pin of [...srcPins, ...dstPins]) {
                        pin.neighbours = [];
                        pin.wire = new Wire();

                        if (pin instanceof OutputPin) pin.wire.state = pin.getState();

                        pin.wire.points.push(pin);
                        mainCircuit.wires.push(pin.wire);
                    }

                    mainCircuit.wires.splice(mainCircuit.wires.indexOf(wire), 1);
                    Circuit.evaluate(dstChips);
                }

                mainCircuit.wires.forEach(w => w.optimizeStructure());
            },

            mousePressedRightCtrl: function () { },

            mousePressedLeft: function () {
                loop: for (const chip of mainCircuit.chips) {
                    for (const pin of [...Object.values(chip.iPins), ...Object.values(chip.oPins)]) if (pin.isMouseOver()) {
                        for (const ch of mainCircuit.chips.slice().reverse()) {
                            if (ch == pin.chip) break;
                            if (ch.isMouseOver() && ch != pin.chip) break loop;
                        }

                        WiringTool.wirePoint = pin;
                        StateHandler.setActiveState("WIRING");
                        return;
                    }
                }

                for (const chip of mainCircuit.chips.slice().reverse()) {
                    if (chip.isMouseOver()) {
                        mainCircuit.chips.splice(mainCircuit.chips.indexOf(chip), 1);
                        mainCircuit.chips.push(chip);
                        chip.select();
                        return;
                    }
                }

                let wireSegment;
                if ((wireSegment = WiringTool.getGridAlignedWireSegment(Viewport.getGlobalMousePos(true))) != null) {
                    let wirePoint = new NonPin(Viewport.getGlobalMousePos(true), wireSegment.point0.wire);

                    wireSegment.point0.neighbours = wireSegment.point0.neighbours.filter(p => p != wireSegment.point1);
                    wirePoint.connect(wireSegment.point0);
                    wireSegment.point0.connect(wirePoint);

                    wireSegment.point1.neighbours = wireSegment.point1.neighbours.filter(p => p != wireSegment.point0);
                    wirePoint.connect(wireSegment.point1);
                    wireSegment.point1.connect(wirePoint);

                    WiringTool.wirePoint = wirePoint;
                    StateHandler.setActiveState("WIRING");
                    return;
                }

                let wirePoint;
                loop: for (const wire of mainCircuit.wires) {
                    if ((wirePoint = wire.points.find(p => p.isMouseOver())) != null) {
                        for (const ch of mainCircuit.chips.slice().reverse()) if (ch.isMouseOver() && ch != wirePoint.chip) break loop;

                        WiringTool.wirePoint = wirePoint;
                        StateHandler.setActiveState("WIRING");
                        return;
                    }
                }
            },

            mousePressedLeftShift: function () {
                Viewport.startPan();
            },

            mousePressedLeftCtrl: function () {
                for (const chip of mainCircuit.chips.slice().reverse()) if (chip.isMouseOver() && [BuiltinChipCode.INPUT, BuiltinChipCode.OUTPUT].includes(chip.code)) chip.rename();
            },

            mouseReleasedRight: function () { },

            mouseReleasedLeft: function () {
                for (const chip of mainCircuit.chips) chip.deselect();
                mainCircuit.wires.forEach(w => w.optimizeStructure());
                Viewport.stopPan();
            },

            mouseDragged: function () {
                for (const chip of mainCircuit.chips) chip.mouseDragged();
            },

            keyPressed: function (key, shiftKey, ctrlKey, altKey) {
                if (key == 'r' && !shiftKey && !ctrlKey && !altKey) {
                    for (const chip of mainCircuit.chips.slice().reverse()) if (chip.isMouseOver()) {
                        chip.rotate();
                        break;
                    }
                }

                if (key == 'delete') {
                    for (const chip of mainCircuit.chips.slice().reverse()) if (chip.isMouseOver()) {
                        let nonPinList = [];

                        for (const pin of [...Object.values(chip.iPins), ...Object.values(chip.oPins)]) {

                            let nonPin = new NonPin(pin.getGlobalPos(), pin.wire);
                            nonPinList.push(nonPin);

                            pin.wire.points = pin.wire.points.filter(p => p != pin);
                            pin.wire.state = WiringTool.combineWireStates(pin.wire.getSrcPins().map(p => p.getState()))
                            nonPin.neighbours = pin.neighbours;

                            for (const neighbour of pin.neighbours) {
                                neighbour.neighbours = neighbour.neighbours.filter(p => p != pin);
                                neighbour.neighbours.push(nonPin);
                            }
                        }

                        mainCircuit.chips = mainCircuit.chips.filter(ch => ch != chip);
                        Circuit.evaluate(nonPinList.map(p => p.wire.getDstChips()).flat());
                        break;
                    }

                    mainCircuit.wires = mainCircuit.wires.filter(w => !(w.points.length == 1 && w.points[0] instanceof NonPin));
                }

                if (key == 'd' && shiftKey && ctrlKey && !altKey) {
                    mainCircuit = new Circuit();
                }

                if (key == 'q') {
                    for (const chip of mainCircuit.chips.slice().reverse()) if (chip.code == "CUSTOM" && chip.isMouseOver()) {
                        circuitHistory.push(mainCircuit);
                        mainCircuit = chip.evaluation.circuit;
                        StateHandler.setActiveState("SUBCIRCUIT");
                        break;
                    }
                }

                if (key == "shift") WiringTool.fullHighlightMode = true;
            },

            keyReleased: function (key, shiftKey, ctrlKey, altKey) {
                if (key == "shift") WiringTool.fullHighlightMode = false;
            },

            update: function () {
                Viewport.update();
                mainCircuit.update();
            },
        };

        this.states["WIRING"] = {
            activate: function () {
                WiringTool.diagonalMode = false;
            },

            deactivate: function () { },

            mouseWheelUp: function () {
                Viewport.applyZoom(1.05);
            },

            mouseWheelDown: function () {
                Viewport.applyZoom(0.95);
            },

            mousePressedRight: function () {
                WiringTool.wirePoint = null;
                StateHandler.setActiveState("DEFAULT");
            },

            mousePressedRightShift: function () { },

            mousePressedRightCtrl: function () { },

            mousePressedLeft: function () {
                if (!WiringTool.extendWire()) StateHandler.setActiveState("DEFAULT");
                mainCircuit.wires.forEach(w => w.optimizeStructure());
            },

            mousePressedLeftShift: function () {
                Viewport.startPan();
            },

            mousePressedLeftCtrl: function () {
                this.mousePressedLeft();
            },

            mouseReleasedRight: function () { },

            mouseReleasedLeft: function () {
                Viewport.stopPan();
            },

            mouseDragged: function () { },

            keyPressed: function (key, shiftKey, ctrlKey, altKey) {
                if (key == "control") WiringTool.diagonalMode = true;
            },

            keyReleased: function (key, shiftKey, ctrlKey, altKey) {
                if (key == "control") WiringTool.diagonalMode = false;
            },

            update: function () {
                Viewport.update();
                mainCircuit.update();

                noFill();
                strokeWeight(5);
                stroke(getStateColor(WiringTool.wirePoint.getState()));
                line(WiringTool.wirePoint.getGlobalPosX(), WiringTool.wirePoint.getGlobalPosY(), WiringTool.getSnapMousePosX(), WiringTool.getSnapMousePosY());
            },
        };

        this.states["MODULE"] = {
            activate: function () {
                document.getElementById("MODULE").style.display = "block";
            },

            deactivate: function () {
                document.getElementById("MODULE").style.display = "none";
            },

            mouseWheelUp: function () { },

            mouseWheelDown: function () { },

            mousePressedRight: function () { },

            mousePressedRightShift: function () { },

            mousePressedRightCtrl: function () { },

            mousePressedLeft: function () {
                ModuleTool.select();
            },

            mousePressedLeftShift: function () { },

            mousePressedLeftCtrl: function () { },

            mouseReleasedRight: function () { },

            mouseReleasedLeft: function () {
                ModuleTool.deselect();
            },

            mouseDragged: function () { },

            keyPressed: function (key, shiftKey, ctrlKey, altKey) {
                if (key == "control") ModuleTool.showLabels = true;
            },

            keyReleased: function (key, shiftKey, ctrlKey, altKey) {
                if (key == "control") ModuleTool.showLabels = false;
            },

            update: function () {
                background(200);
                strokeWeight(2);
                stroke(150);

                for (let x = 0; x < Math.round(width / 2 / GRID_SIZE) + 1; x++) {
                    line(width / 2 - x * GRID_SIZE, 0, width / 2 - x * GRID_SIZE, height);
                    line(width / 2 + x * GRID_SIZE, 0, width / 2 + x * GRID_SIZE, height);
                }

                for (let x = 0; x < Math.round(height / 2 / GRID_SIZE) + 1; x++) {
                    line(0, height / 2 - x * GRID_SIZE, width, height / 2 - x * GRID_SIZE);
                    line(0, height / 2 + x * GRID_SIZE, width, height / 2 + x * GRID_SIZE);
                }

                rectMode(CENTER);
                stroke(0);
                strokeWeight(3);
                fill(255);
                rect(width / 2, height / 2, ModuleTool.size.x * GRID_SIZE, ModuleTool.size.y * GRID_SIZE);

                noStroke();
                fill(0);
                textAlign(CENTER, CENTER);
                textSize(25);

                if (ModuleTool.size.x * GRID_SIZE < textWidth(ModuleTool.name)) displayVerticalText(ModuleTool.name, width / 2, height / 2);
                else text(ModuleTool.name, width / 2, height / 2);

                if (ModuleTool.selectedConfigurablePin != null) {
                    let stateColor = ModuleTool.selectedConfigurablePin.type == WirePoint.INPUT_PIN ? getStateColor(WireState.FLOATING) : color(41, 128, 185);

                    noStroke();
                    fill(stateColor);
                    circle(mouseX, mouseY, POINT_SIZE);

                    stroke(stateColor);
                    strokeWeight(3);
                    noFill();
                    circle(mouseX, mouseY, 2.5 * POINT_SIZE);
                }

                for (const data of ModuleTool.getSpotData()) {
                    if (data.pin == null) continue;

                    let stateColor = (data.pin.type == WirePoint.INPUT_PIN) ? getStateColor(WireState.FLOATING) : color(41, 128, 185);

                    noStroke();
                    fill(stateColor);
                    circle(data.globalPos.x, data.globalPos.y, POINT_SIZE);

                    if (createVector(data.globalPos.x, data.globalPos.y).dist(createVector(mouseX, mouseY)) < GRID_SIZE / 2) {
                        stroke(stateColor);
                        strokeWeight(3);
                        noFill();
                        circle(data.globalPos.x, data.globalPos.y, 2.5 * POINT_SIZE);

                        Label.display(data.pin.name, data.direction, data.globalPos, 20);
                    }

                    if (ModuleTool.showLabels) Label.display(data.pin.name, data.direction, data.globalPos, 20);
                }
            },
        };

        this.states["SUBCIRCUIT"] = {
            activate: function () {
                document.getElementById("SUBCIRCUIT").style.display = "block";
            },

            deactivate: function () {
                document.getElementById("SUBCIRCUIT").style.display = "none";
            },

            mouseWheelUp: function () {
                Viewport.applyZoom(1.05);
            },

            mouseWheelDown: function () {
                Viewport.applyZoom(0.95);
            },

            mousePressedRight: function () { },

            mousePressedRightShift: function () { },

            mousePressedRightCtrl: function () { },

            mousePressedLeft: function () { },

            mousePressedLeftShift: function () {
                Viewport.startPan();
            },

            mousePressedLeftCtrl: function () { },

            mouseReleasedRight: function () { },

            mouseReleasedLeft: function () {
                Viewport.stopPan();
            },

            mouseDragged: function () { },

            keyPressed: function (key, shiftKey, ctrlKey, altKey) {
                if (key == 'q' && !shiftKey) {
                    for (const chip of mainCircuit.chips.slice().reverse()) if (chip.code == "CUSTOM" && chip.isMouseOver()) {
                        circuitHistory.push(mainCircuit);
                        mainCircuit = chip.evaluation.circuit;
                        break;
                    }
                }

                if (key == 'q' && shiftKey) {
                    {
                        mainCircuit = circuitHistory.pop();
                        if (circuitHistory.length == 0) StateHandler.setActiveState("DEFAULT");
                    }
                }
            },

            keyReleased: function (key, shiftKey, ctrlKey, altKey) { },

            update: function () {
                Viewport.update();
                mainCircuit.update();
            },
        };

        this.states["DEFAULT"].activate();
        this.activeState = this.states["DEFAULT"];
    },

    setActiveState: function (name) {
        this.activeState.deactivate();
        this.states[name].activate();
        this.activeState = this.states[name];
    },

    getActiveState: function () {
        return Object.keys(this.states).find(key => this.states[key] === this.activeState);
    }
};