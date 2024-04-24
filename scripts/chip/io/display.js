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

class SevenSegmentDisplay extends ChipCore {
    constructor(pos) {
        super(pos, BuiltinChipCode.SEVEN_SEGMENT_DISPLAY, { x: 6, y: 10 }, "", { "Show": { "offset": { "x": -2, "y": 5 } }, "8": { "offset": { "x": -1, "y": 5 } }, "4": { "offset": { "x": 0, "y": 5 } }, "2": { "offset": { "x": 1, "y": 5 } }, "1": { "offset": { "x": 2, "y": 5 } } }, {});
    }

    rotate() { }

    display() {
        rectMode(CENTER);
        stroke(0);
        strokeWeight(3);
        fill(0);
        rect(this.pos.x, this.pos.y, this.size.x * GRID_SIZE, this.size.y * GRID_SIZE);

        if (this.getInputState("Show") == WireState.ON) {
            rectMode(CENTER);
            noStroke();
            fill(230, 0, 0);

            const SEGMENT_LENGTH = 3 * GRID_SIZE;
            const OFFSET = 1.7 * GRID_SIZE;

            let bits = [this.getInputState("8"), this.getInputState("4"), this.getInputState("2"), this.getInputState("1")].join('');

            if (["0000", "0010", "0011", "0101", "0110", "0111", "1000", "1001"].includes(bits)) rect(this.pos.x, this.pos.y - 2 * OFFSET, SEGMENT_LENGTH, 10, 10);

            if (["0000", "0100", "0101", "0110", "1000", "1001"].includes(bits)) rect(this.pos.x - OFFSET, this.pos.y - OFFSET, 10, SEGMENT_LENGTH, 10);
            if (["0000", "0001", "0010", "0011", "0100", "0111", "1000", "1001"].includes(bits)) rect(this.pos.x + OFFSET, this.pos.y - OFFSET, 10, SEGMENT_LENGTH, 10);

            if (["0010", "0011", "0100", "0101", "0110", "1000", "1001", "1010"].includes(bits)) rect(this.pos.x, this.pos.y, SEGMENT_LENGTH, 10, 10);

            if (["0000", "0010", "0110", "1000"].includes(bits)) rect(this.pos.x - OFFSET, this.pos.y + OFFSET, 10, SEGMENT_LENGTH, 10);
            if (["0000", "0001", "0011", "0100", "0101", "0110", "0111", "1000", "1001"].includes(bits)) rect(this.pos.x + OFFSET, this.pos.y + OFFSET, 10, SEGMENT_LENGTH, 10);

            if (["0000", "0010", "0011", "0101", "0110", "1000", "1001"].includes(bits)) rect(this.pos.x, this.pos.y + 2 * OFFSET, SEGMENT_LENGTH, 10, 10);
        }
    }
}