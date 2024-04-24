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

class Label {
    static display(name, direction, point, offset) {
        switch (direction) {
            case Direction.RIGHT:
            case Direction.LEFT:
                {
                    let dir = (direction == Direction.RIGHT) ? 1 : -1;
                    let pos = { x: point.x + dir * (textWidth(name) / 2 + offset), y: point.y }

                    rectMode(CENTER);
                    noStroke();
                    fill(0);
                    rect(pos.x, pos.y, textWidth(name) + 10, 30, 5, 5, 5, 5);

                    textAlign(CENTER, CENTER);
                    textSize(25);
                    noStroke();
                    fill(255);
                    text(name, pos.x, pos.y);
                    break;
                }
            case Direction.UP:
            case Direction.DOWN:
                {
                    let dir = (direction == Direction.DOWN) ? 1 : -1;
                    let pos = { x: point.x, y: point.y + dir * (textHeight(name) / 2 + offset) };

                    rectMode(CENTER);
                    noStroke();
                    fill(0);
                    rect(pos.x, pos.y, 30, textHeight(name) + 10, 5, 5, 5, 5);

                    textAlign(CENTER, CENTER);
                    textSize(25);
                    noStroke();
                    fill(255);
                    displayVerticalText(name, pos.x, pos.y);
                    break;
                }
        }
    }
}