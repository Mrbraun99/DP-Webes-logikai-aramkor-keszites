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

class Pin extends WirePoint {
    constructor(offset, name, chip) {
        super(new Wire());

        this.offset = offset;
        this.name = name;
        this.chip = chip;
    }

    getGlobalPos() {
        return { x: this.getGlobalPosX(), y: this.getGlobalPosY() };
    }

    getGlobalPosX() {
        return this.chip.pos.x + this.offset.x * GRID_SIZE;
    }

    getGlobalPosY() {
        return this.chip.pos.y + this.offset.y * GRID_SIZE;
    }

    update() {
        super.update();

        if (this.isMouseOver()) {
            for (const ch of mainCircuit.chips.slice().reverse()) {
                if (ch == this.chip) break;
                if (ch.isMouseOver() && ch != this.chip) return;
            }

            stroke(getStateColor(this.getState()));
            strokeWeight(3);
            noFill();
            circle(this.getGlobalPosX(), this.getGlobalPosY(), 2.5 * POINT_SIZE);

            Label.display(this.name, this.chip.getPinRelativeDirection(this), this.getGlobalPos(), 20);
        }
    }
}

class InputPin extends Pin {
    constructor(offset, name, chip) {
        super(offset, name, chip);
    }

    getState() {
        return this.wire.state;
    }

    setState(state) {
        this.wire.state = state;
    }
}

class OutputPin extends Pin {
    constructor(offset, name, chip, state) {
        super(offset, name, chip);

        this.state = state;
        this.wire.state = state;
    }

    getState() {
        return this.state;
    }

    setState(state) {
        this.state = state;
    }
}