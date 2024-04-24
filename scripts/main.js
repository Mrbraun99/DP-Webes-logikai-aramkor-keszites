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

const MouseButton = Object.freeze({ LEFT: 0, MIDDLE: 1, RIGHT: 2 });
const WireState = Object.freeze({ OFF: 0, ON: 1, FLOATING: 2, ERROR: 3 });
const Direction = Object.freeze({ LEFT: 0, RIGHT: 1, UP: 2, DOWN: 3 });

function getStateColor(state) {
    if (state == WireState.OFF) return color(0, 120, 0);
    if (state == WireState.ON) return color(0, 255, 0);
    if (state == WireState.FLOATING) return color(0, 0, 200);
    if (state == WireState.ERROR) return color(255, 0, 0);
}

function displayVerticalText(str, x, y) {
    for (let i = 0; i < str.length; i++) text(str[i], x, y + textSize() / 2 - ((str.length / 2 - i) * textSize()));
}

function textHeight(str) {
    return str.length * textSize();
}

var mainCircuit;
var circuitHistory = [];

function setup() {
    let canvas = createCanvas(window.innerWidth, window.innerHeight);
    textFont("monospace");
    Viewport.init();
    StateHandler.init();

    mainCircuit = new Circuit();

    canvas.drop((file) => {
        if (StateHandler.getActiveState() != "DEFAULT") return;

        if (file.name.split(".").pop() != "circuit") {
            alert("Not  supported file! Please load .circuit file!");
            return;
        }

        fetch(file.data).then(res => res.blob()).then(blob => {
            let reader = new FileReader();
            reader.onload = function () {
                Viewport.reset();
                mainCircuit.load(JSON.parse(reader.result));
            }
            reader.readAsText(blob);
        });
    });
}

function draw() {
    StateHandler.activeState.update();
}

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
    Viewport.resize();
}

function mouseWheel(event) {
    if (event.deltaY < 0) StateHandler.activeState.mouseWheelUp();
    if (event.deltaY > 0) StateHandler.activeState.mouseWheelDown();
}

function mousePressed(event) {
    if (event.button == MouseButton.RIGHT) {
        if (event.shiftKey) return StateHandler.activeState.mousePressedRightShift();
        if (event.ctrlKey) return StateHandler.activeState.mousePressedRightCtrl();
        return StateHandler.activeState.mousePressedRight();
    }

    if (event.button == MouseButton.LEFT) {
        if (event.shiftKey) return StateHandler.activeState.mousePressedLeftShift();
        if (event.ctrlKey) return StateHandler.activeState.mousePressedLeftCtrl();
        return StateHandler.activeState.mousePressedLeft();
    }
}

function mouseReleased(event) {
    if (event.button == MouseButton.RIGHT) StateHandler.activeState.mouseReleasedRight();
    if (event.button == MouseButton.LEFT) StateHandler.activeState.mouseReleasedLeft();
}

function mouseDragged() {
    StateHandler.activeState.mouseDragged();
}

document.oncontextmenu = function () {
    return false;
}

document.addEventListener('keydown', event => {
    if (event.key.toLowerCase() == 'd' && event.ctrlKey) event.preventDefault();

    StateHandler.activeState.keyPressed(event.key.toLowerCase(), event.shiftKey, event.ctrlKey, event.altKey);
});

document.addEventListener('keyup', event => {
    StateHandler.activeState.keyReleased(event.key.toLowerCase(), event.shiftKey, event.ctrlKey, event.altKey);
});