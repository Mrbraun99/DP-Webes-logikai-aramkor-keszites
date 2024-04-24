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

class OutputChip extends ChipCore {
    constructor(pos) {
        super(pos, BuiltinChipCode.OUTPUT, { x: 2, y: 2 }, "Out", { "In": { "offset": { "x": -2, "y": 0 } } }, {});
    }

    rename() {
        this.name = prompt("New name: ", this.name);
        if (this.name == null || this.name == "") this.name = "Out";
    }

    display() {
        stroke(0);
        strokeWeight(8);
        line(this.pos.x, this.pos.y, this.iPins["In"].getGlobalPosX(), this.iPins["In"].getGlobalPosY());

        rectMode(CENTER);
        stroke(0);
        strokeWeight(3);
        fill(getStateColor(this.getInputState("In")));
        rect(this.pos.x, this.pos.y, this.size.x * GRID_SIZE, this.size.y * GRID_SIZE);

        Label.display(this.name, this.getPinRelativeDirection(this.iPins["In"], true), this.pos, GRID_SIZE + 10);
    }
}