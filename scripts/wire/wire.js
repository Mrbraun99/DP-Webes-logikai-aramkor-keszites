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

class Wire {
    constructor() {
        this.state = WireState.FLOATING;
        this.points = [];
    }

    optimizeStructure() {
        for (let i = this.points.length - 1; i >= 0; i--) {
            let wirePoint = this.points[i];

            if (wirePoint.neighbours.length == 2) {
                if ((wirePoint.getGlobalPosX() == wirePoint.neighbours[0].getGlobalPosX() && wirePoint.getGlobalPosX() == wirePoint.neighbours[1].getGlobalPosX()) || (wirePoint.getGlobalPosY() == wirePoint.neighbours[0].getGlobalPosY() && wirePoint.getGlobalPosY() == wirePoint.neighbours[1].getGlobalPosY())) {
                    wirePoint.neighbours[0].neighbours = wirePoint.neighbours[0].neighbours.filter(p => p != wirePoint);
                    wirePoint.neighbours[1].neighbours = wirePoint.neighbours[1].neighbours.filter(p => p != wirePoint);

                    wirePoint.neighbours[0].connect(wirePoint.neighbours[1]);
                    wirePoint.neighbours[1].connect(wirePoint.neighbours[0]);

                    this.points.splice(i, 1);
                    continue;
                }
            }
        }
    }

    getSrcPins() {
        return this.points.filter(p => p instanceof OutputPin);
    }

    getDstPins() {
        return this.points.filter(p => p instanceof InputPin);
    }

    getDstChips() {
        return this.getDstPins().map(p => p.chip);
    }

    getGridAlignedWireSegment(pos) {
        for (const wirePoint of this.points) {
            for (const neighbour of wirePoint.neighbours) {
                if (wirePoint.getGlobalPosX() < pos.x && Viewport.getGlobalMousePosX(true) < neighbour.getGlobalPosX() && pos.y == wirePoint.getGlobalPosY() && pos.y == neighbour.getGlobalPosY()) return { "point0": wirePoint, "point1": neighbour };
                if (wirePoint.getGlobalPosY() < pos.y && Viewport.getGlobalMousePosY(true) < neighbour.getGlobalPosY() && pos.x == wirePoint.getGlobalPosX() && pos.x == neighbour.getGlobalPosX()) return { "point0": wirePoint, "point1": neighbour };
            }
        }
    }

    getAllWireSegment(pos) {
        for (const wirePoint of this.points) {
            for (const neighbour of wirePoint.neighbours) {
                let a = createVector(wirePoint.getGlobalPosX(), wirePoint.getGlobalPosY());
                let b = createVector(neighbour.getGlobalPosX(), neighbour.getGlobalPosY());
                let p = createVector(pos.x, pos.y);

                let d1 = p5.Vector.sub(b, a);
                let d2 = p5.Vector.sub(p, a);
                let len = d1.mag();

                if (p5.Vector.dist(p, p5.Vector.add(a, d1.mult(constrain(d2.dot(d1.normalize()), 0, len)))) < 4) return { "point0": wirePoint, "point1": neighbour };
            }
        }
    }

    update() {
        let wireSegment = this.getAllWireSegment(Viewport.getGlobalMousePos());

        for (const wirePoint of this.points) {
            if (wirePoint instanceof WirePoint) wirePoint.update();
            for (const neighbour of wirePoint.neighbours) {
                noFill();
                stroke(getStateColor(this.state));
                strokeWeight(5);

                if (WiringTool.fullHighlightMode && wireSegment != null) strokeWeight(8);
                line(wirePoint.getGlobalPosX(), wirePoint.getGlobalPosY(), neighbour.getGlobalPosX(), neighbour.getGlobalPosY());
            }
        }

        if (!WiringTool.fullHighlightMode && wireSegment != null) {
            strokeWeight(8);
            line(wireSegment["point0"].getGlobalPosX(), wireSegment["point0"].getGlobalPosY(), wireSegment["point1"].getGlobalPosX(), wireSegment["point1"].getGlobalPosY());
        }
    }
}