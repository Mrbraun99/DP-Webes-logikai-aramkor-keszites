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

const WiringTool = {
    wirePoint: null,
    diagonalMode: false,
    fullHighlightMode: false,

    getSnapMousePos: function () {
        return { x: WiringTool.getSnapMousePosX(), y: WiringTool.getSnapMousePosY() };
    },

    getSnapMousePosX: function () {
        if (WiringTool.diagonalMode) return Viewport.getGlobalMousePosX(true);

        let xOffset = Math.abs(WiringTool.wirePoint.getGlobalPosX() - Viewport.getGlobalMousePosX(true));
        let yOffset = Math.abs(WiringTool.wirePoint.getGlobalPosY() - Viewport.getGlobalMousePosY(true));

        if (xOffset > yOffset) return Viewport.getGlobalMousePosX(true);
        return WiringTool.wirePoint.getGlobalPosX();
    },

    getSnapMousePosY: function () {
        if (WiringTool.diagonalMode) return Viewport.getGlobalMousePosY(true);

        let xOffset = Math.abs(WiringTool.wirePoint.getGlobalPosX() - Viewport.getGlobalMousePosX(true));
        let yOffset = Math.abs(WiringTool.wirePoint.getGlobalPosY() - Viewport.getGlobalMousePosY(true));

        if (yOffset > xOffset) return Viewport.getGlobalMousePosY(true);
        return WiringTool.wirePoint.getGlobalPosY();
    },

    getGridAlignedWireSegment: function (pos) {
        let wireSegment;
        for (const wire of mainCircuit.wires) {
            if ((wireSegment = wire.getGridAlignedWireSegment(pos)) != null) return wireSegment;
        }
    },

    getAllWireSegment: function (pos) {
        let wireSegment;
        for (const wire of mainCircuit.wires) {
            if ((wireSegment = wire.getAllWireSegment(pos)) != null) return wireSegment;
        }
    },

    combineWireStates: function (states) {
        if (states.some(s => s == WireState.ERROR)) return WireState.ERROR;
        if (states.every(s => s == WireState.FLOATING)) return WireState.FLOATING;

        if (states.filter(s => s == WireState.OFF).length > 0 && states.find(s => s == WireState.ON) == null) return WireState.OFF;
        if (states.filter(s => s == WireState.ON).length > 0 && states.find(s => s == WireState.OFF) == null) return WireState.ON;

        return WireState.ERROR;
    },

    mergeWires: function (wire0, wire1) {
        wire1.points.push(...wire0.points.splice(0, wire0.points.length));
        for (const point of wire1.points) point.wire = wire1;
        mainCircuit.wires = mainCircuit.wires.filter(w => w.points.length > 0);
    },

    sameWire(wirePoint0, wirePoint1) {
        let queue = [wirePoint0];
        let visitedPoints = [];

        while (queue.length != 0) {
            let wirePoint = queue.pop();
            if (wirePoint.visited) continue;

            wirePoint.visited = true;
            visitedPoints.push(wirePoint);

            for (const neighbour of wirePoint.neighbours) {
                if (neighbour == wirePoint1) {
                    for (const p of visitedPoints) p.visited = false;
                    return true;
                }

                queue.push(neighbour);
            }
        }

        for (const p of visitedPoints) p.visited = false;
        return false;
    },

    extendWire: function () {
        let wirePoint;

        loop: for (const wire of mainCircuit.wires) {
            if ((wirePoint = wire.points.find(p => p.isMouseOver())) != null) {
                for (const ch of mainCircuit.chips.slice().reverse()) {
                    if (ch == wirePoint.chip) break;
                    if (ch.isMouseOver() && ch != wirePoint.chip) break loop;
                }

                if (wirePoint == WiringTool.wirePoint) return false;

                WiringTool.wirePoint.connect(wirePoint);
                wirePoint.connect(WiringTool.wirePoint);

                if (wirePoint.wire != WiringTool.wirePoint.wire) WiringTool.mergeWires(WiringTool.wirePoint.wire, wirePoint.wire);
                wirePoint.wire.state = WiringTool.combineWireStates(wirePoint.wire.getSrcPins().map(p => p.getState()));
                Circuit.evaluate(wirePoint.wire.getDstChips());

                WiringTool.wirePoint = null;
                return false;
            }
        }

        for (const chip of mainCircuit.chips.slice().reverse()) if (chip.isMouseOver()) return false;

        let wireSegment;
        if ((wireSegment = WiringTool.getGridAlignedWireSegment(Viewport.getGlobalMousePos(true))) != null) {
            let wirePoint = new NonPin(Viewport.getGlobalMousePos(true), wireSegment.point0.wire);

            wireSegment.point0.neighbours = wireSegment.point0.neighbours.filter(p => p != wireSegment.point1);
            wirePoint.connect(wireSegment.point0);
            wireSegment.point0.connect(wirePoint);

            wireSegment.point1.neighbours = wireSegment.point1.neighbours.filter(p => p != wireSegment.point0);
            wirePoint.connect(wireSegment.point1);
            wireSegment.point1.connect(wirePoint);

            WiringTool.wirePoint.connect(wirePoint);
            wirePoint.connect(WiringTool.wirePoint);

            if (wirePoint.wire != WiringTool.wirePoint.wire) WiringTool.mergeWires(WiringTool.wirePoint.wire, wirePoint.wire);
            wirePoint.wire.state = WiringTool.combineWireStates(wirePoint.wire.getSrcPins().map(p => p.getState()));
            Circuit.evaluate(wirePoint.wire.getDstChips());

            WiringTool.wirePoint = null;
            return false;
        }

        wirePoint = new NonPin(WiringTool.getSnapMousePos(), WiringTool.wirePoint.wire);

        WiringTool.wirePoint.connect(wirePoint);
        wirePoint.connect(WiringTool.wirePoint);

        WiringTool.wirePoint = wirePoint;
        return true;
    }
}