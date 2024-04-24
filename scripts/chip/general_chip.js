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

class GeneralChip extends ChipCore {
    constructor(pos, code, size, name, color, evaluation, iPinsData, oPinsData) {
        super(pos, code, size, name, iPinsData, oPinsData);

        this.color = color;
        this.evaluation = evaluation;
    }

    evaluate() {
        let result = this.evaluation.evaluate(Object.assign({}, ...Object.entries(this.iPins).map(([key, pin]) => ({ [key]: pin.getState() }))));
        for (let [key, value] of Object.entries(result)) this.oPins[key].setState(value);
    }

    display() {
        rectMode(CENTER);
        stroke(0);
        strokeWeight(3);
        fill(this.color);
        rect(this.pos.x, this.pos.y, this.size.x * GRID_SIZE, this.size.y * GRID_SIZE);

        noStroke();
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(25);

        if (this.size.x * GRID_SIZE < textWidth(this.name)) displayVerticalText(this.name, this.pos.x, this.pos.y);
        else text(this.name, this.pos.x, this.pos.y);
    }
}