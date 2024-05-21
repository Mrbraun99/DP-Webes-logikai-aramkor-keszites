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

const GRID_SIZE = 20;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5

const Viewport = {
    zoom: 1,
    panning: false,
    offsetZoom: { x: 0, y: 0 },
    offsetPan: { x: 0, y: 0 },
    offsetPanOld: { x: 0, y: 0 },
    gridOffset: { x: 0, y: 0 },
    mousePressPos: { x: 0, y: 0 },

    init: function () {
        Viewport.zoom = 1;
        Viewport.panning = false;
        Viewport.offsetZoom = { x: 0, y: 0 };
        Viewport.offsetPan = { x: width / 2, y: height / 2 };
        Viewport.offsetPanOld = { x: 0, y: 0 };
        Viewport.gridOffset = { x: 0, y: 0 };
        Viewport.mousePressPos = { x: 0, y: 0 };

        Viewport.generateGridImg();
    },

    startPan: function () {
        Viewport.mousePressPos = { x: mouseX, y: mouseY };
        Viewport.offsetPanOld = { x: Viewport.offsetPan.x, y: Viewport.offsetPan.y };
        Viewport.panning = true;
    },

    stopPan: function () {
        Viewport.panning = false;
    },

    applyZoom: function (scale) {
        let constrainedZoom = constrain(Viewport.zoom * scale, MIN_ZOOM, MAX_ZOOM);
        let diff = constrainedZoom / Viewport.zoom;
        Viewport.zoom = constrainedZoom;

        Viewport.offsetZoom.x = (mouseX - mouseX * diff) + (diff * Viewport.offsetZoom.x);
        Viewport.offsetZoom.y = (mouseY - mouseY * diff) + (diff * Viewport.offsetZoom.y);
        Viewport.generateGridImg();
    },

    update: function () {
        if (Viewport.panning) {
            Viewport.offsetPan.x = Viewport.offsetPanOld.x + (mouseX - Viewport.mousePressPos.x) / Viewport.zoom;
            Viewport.offsetPan.y = Viewport.offsetPanOld.y + (mouseY - Viewport.mousePressPos.y) / Viewport.zoom;
        }

        Viewport.gridOffset.x = (Viewport.offsetZoom.x + Viewport.offsetPan.x * Viewport.zoom) % (GRID_SIZE * Viewport.zoom) - GRID_SIZE * Viewport.zoom;
        Viewport.gridOffset.y = (Viewport.offsetZoom.y + Viewport.offsetPan.y * Viewport.zoom) % (GRID_SIZE * Viewport.zoom) - GRID_SIZE * Viewport.zoom;

        imageMode(CORNER);
        image(Viewport.gridImg, Viewport.gridOffset.x, Viewport.gridOffset.y);

        translate(Viewport.offsetZoom.x, Viewport.offsetZoom.y);
        scale(Viewport.zoom);
        translate(Viewport.offsetPan.x, Viewport.offsetPan.y);
    },

    getGlobalMousePos: function (gridAlign = false) {
        return { x: Viewport.getGlobalMousePosX(gridAlign), y: Viewport.getGlobalMousePosY(gridAlign) };
    },

    getGlobalMousePosX: function (gridAlign = false) {
        let x = (mouseX - Viewport.offsetZoom.x) / Viewport.zoom - Viewport.offsetPan.x;
        return gridAlign ? Math.round(x / GRID_SIZE) * GRID_SIZE : x;
    },

    getGlobalMousePosY: function (gridAlign = false) {
        let y = (mouseY - Viewport.offsetZoom.y) / Viewport.zoom - Viewport.offsetPan.y;
        return gridAlign ? Math.round(y / GRID_SIZE) * GRID_SIZE : y;
    },

    getScreenCenterGlobalPos: function () {
        return { x: Math.round((((width / 2) - Viewport.offsetZoom.x) / Viewport.zoom - Viewport.offsetPan.x) / GRID_SIZE) * GRID_SIZE, y: Math.round((((height / 2) - Viewport.offsetZoom.y) / Viewport.zoom - Viewport.offsetPan.y) / GRID_SIZE) * GRID_SIZE };
    },

    saveProperties: function () {
        return { "zoom": Viewport.zoom, "offsetZoom": { x: Viewport.offsetZoom.x, y: Viewport.offsetZoom.y }, "offsetPan": { x: Viewport.offsetPan.x, y: Viewport.offsetPan.y }, "gridOffset": { x: Viewport.gridOffset.x, y: Viewport.gridOffset.y } };
    },

    loadProperties: function (properties) {
        Viewport.zoom = properties.zoom;
        Viewport.offsetZoom = properties.offsetZoom;
        Viewport.offsetPan = properties.offsetPan;
        Viewport.gridOffset = properties.gridOffset;

        Viewport.generateGridImg();
    },

    reset: function () {
        Viewport.zoom = 1;
        Viewport.panning = false;
        Viewport.offsetZoom = { x: 0, y: 0 };
        Viewport.offsetPan = { x: width / 2, y: height / 2 };
        Viewport.offsetPanOld = { x: 0, y: 0 };
        Viewport.gridOffset = { x: 0, y: 0 };
        Viewport.mousePressPos = { x: 0, y: 0 };

        Viewport.generateGridImg();
    },

    resize: function () {
        Viewport.generateGridImg();
    },

    generateGridImg: function () {
        Viewport.gridImg?.remove();
        let img = createGraphics(width + 2 * GRID_SIZE * Viewport.zoom, height + 2 * GRID_SIZE * Viewport.zoom);

        img.background(200);
        img.strokeWeight(2);
        img.stroke(150);

        for (let x = 0; x <= img.width; x += GRID_SIZE * Viewport.zoom) img.line(x, 0, x, img.height);
        for (let y = 0; y <= img.height; y += GRID_SIZE * Viewport.zoom) img.line(0, y, img.width, y);

        Viewport.gridImg = img;
    }
}