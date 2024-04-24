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

const ModuleTool = {
    selectedConfigurablePin: null,
    name: "",
    size: { x: 0, y: 0 },
    iPinNames: [],
    oPinNames: [],
    spots: {},
    showLabels: false,

    init: function () {
        ModuleTool.iPinNames = mainCircuit.chips.filter(ch => ch.code == BuiltinChipCode.INPUT).sort((a, b) => a.pos.y - b.pos.y).map(ch => ch.name);
        if ((new Set(ModuleTool.iPinNames)).size != ModuleTool.iPinNames.length) {
            alert("All input chip must have unique name!");
            return;
        }

        ModuleTool.oPinNames = mainCircuit.chips.filter(ch => ch.code == BuiltinChipCode.OUTPUT).sort((a, b) => a.pos.y - b.pos.y).map(ch => ch.name);
        if ((new Set(ModuleTool.oPinNames)).size != ModuleTool.oPinNames.length) {
            alert("All output chip must have unique name!");
            return;
        }

        if (ModuleTool.iPinNames.length < 1 || ModuleTool.iPinNames.length > 31) {
            alert("Input chip number must be between 1 and 31");
            return;
        }

        if (ModuleTool.oPinNames.length < 1 || ModuleTool.oPinNames.length > 31) {
            alert("Output chip number must be between 1 and 31");
            return;
        }

        if (ModuleTool.iPinNames.length % 2 == 0) ModuleTool.iPinNames.splice(ModuleTool.iPinNames.length / 2, 0, null);
        if (ModuleTool.oPinNames.length % 2 == 0) ModuleTool.oPinNames.splice(ModuleTool.oPinNames.length / 2, 0, null);

        function mergeToObject(keys, values) {
            return keys.reduce((acc, key, index) => {
                acc[key] = values[index];
                return acc;
            }, {});
        }

        let n = Math.floor(Math.max(ModuleTool.iPinNames.length, ModuleTool.oPinNames.length) / 2) * 2 + 1;
        let spots;

        spots = [... new Array((n - ModuleTool.iPinNames.length) / 2).fill(null), ...ModuleTool.iPinNames.map(name => (name != null) ? { "name": name, "type": WirePoint.INPUT_PIN } : null), ... new Array((n - ModuleTool.iPinNames.length) / 2).fill(null)];
        ModuleTool.spots[Direction.LEFT] = mergeToObject(Array.from(Array(n).keys()).map(v => v - Math.floor(n / 2)), spots);

        spots = [... new Array((n - ModuleTool.oPinNames.length) / 2).fill(null), ...ModuleTool.oPinNames.map(name => (name != null) ? { "name": name, "type": WirePoint.OUTPUT_PIN } : null), ... new Array((n - ModuleTool.oPinNames.length) / 2).fill(null)];
        ModuleTool.spots[Direction.RIGHT] = mergeToObject(Array.from(Array(n).keys()).map(v => v - Math.floor(n / 2)), spots);

        spots = Array(n + 2).fill(null);
        ModuleTool.spots[Direction.UP] = mergeToObject(Array.from(Array(n + 2).keys()).map(v => v - Math.floor((n + 2) / 2)), spots);

        spots = Array(n + 2).fill(null);
        ModuleTool.spots[Direction.DOWN] = mergeToObject(Array.from(Array(n + 2).keys()).map(v => v - Math.floor((n + 2) / 2)), spots);

        ModuleTool.name = "";
        document.getElementById("module_name").value = ModuleTool.name;

        ModuleTool.size.x = n + 3;
        document.getElementById("slider_module_x").value = ModuleTool.size.x;

        ModuleTool.size.y = n + 1;
        document.getElementById("slider_module_y").value = ModuleTool.size.y;

        StateHandler.setActiveState("MODULE");
    },

    getSpotData() {
        let data = [];

        for (const [y, pin] of Object.entries(ModuleTool.spots[Direction.LEFT])) {
            data.push({ "globalPos": { x: width / 2 - ModuleTool.size.x / 2 * GRID_SIZE, y: height / 2 + parseInt(y) * GRID_SIZE }, "direction": Direction.LEFT, "index": y, "pin": pin });
        }

        for (const [y, pin] of Object.entries(ModuleTool.spots[Direction.RIGHT])) {
            data.push({ "globalPos": { x: width / 2 + ModuleTool.size.x / 2 * GRID_SIZE, y: height / 2 + parseInt(y) * GRID_SIZE }, "direction": Direction.RIGHT, "index": y, "pin": pin });
        }

        for (const [x, pin] of Object.entries(ModuleTool.spots[Direction.UP])) {
            data.push({ "globalPos": { x: width / 2 + parseInt(x) * GRID_SIZE, y: height / 2 - ModuleTool.size.y / 2 * GRID_SIZE }, "direction": Direction.UP, "index": x, "pin": pin });
        }

        for (const [x, pin] of Object.entries(ModuleTool.spots[Direction.DOWN])) {
            data.push({ "globalPos": { x: width / 2 + parseInt(x) * GRID_SIZE, y: height / 2 + ModuleTool.size.y / 2 * GRID_SIZE }, "direction": Direction.DOWN, "index": x, "pin": pin });
        }

        return data;
    },

    select() {
        for (const data of ModuleTool.getSpotData()) {
            if (data.pin == null) continue;
            if (createVector(data.globalPos.x, data.globalPos.y).dist(createVector(mouseX, mouseY)) < GRID_SIZE / 2) {
                ModuleTool.spots[data.direction][data.index] = null;
                ModuleTool.selectedConfigurablePin = data.pin;
            }
        }
    },

    deselect() {
        if (ModuleTool.selectedConfigurablePin != null) {
            let availableSpotData = ModuleTool.getSpotData().filter(d => d.pin == null);

            let closestSpot = { "spot_data": availableSpotData[0], "dist": createVector(availableSpotData[0].globalPos.x, availableSpotData[0].globalPos.y).dist(createVector(mouseX, mouseY)) };
            for (let i = 1; i < availableSpotData.length; i++) {
                let dist = createVector(availableSpotData[i].globalPos.x, availableSpotData[i].globalPos.y).dist(createVector(mouseX, mouseY));
                if (dist < closestSpot.dist) {
                    closestSpot["dist"] = dist;
                    closestSpot["spot_data"] = availableSpotData[i];
                }
            }

            ModuleTool.spots[closestSpot["spot_data"].direction][closestSpot["spot_data"].index] = ModuleTool.selectedConfigurablePin;
        }

        ModuleTool.selectedConfigurablePin = null;
    },

    getMinWidth: function () {
        let n = Math.floor((ModuleTool.size.x - 1) / 2);

        for (let i = n; i > 0; i--) {
            if (!(ModuleTool.spots[Direction.UP][-i] == null && ModuleTool.spots[Direction.UP][i] == null && ModuleTool.spots[Direction.DOWN][-i] == null && ModuleTool.spots[Direction.DOWN][i] == null)) return (i + 1) * 2;
        }

        return 2;
    },

    getMinHeight: function () {
        let n = Math.floor((ModuleTool.size.y - 1) / 2);

        for (let i = n; i > 0; i--) {
            if (!(ModuleTool.spots[Direction.LEFT][-i] == null && ModuleTool.spots[Direction.LEFT][i] == null && ModuleTool.spots[Direction.RIGHT][-i] == null && ModuleTool.spots[Direction.RIGHT][i] == null)) return (i + 1) * 2;
        }

        return 2;
    },

    changeChipName: function (name) {
        ModuleTool.name = name;
        document.getElementById("module_name").value = name;

        if (ModuleTool.size.x >= ModuleTool.size.y && textHeight(name) > ModuleTool.size.x * GRID_SIZE) {
            ModuleTool.changeChipSizeX(Math.ceil(Math.ceil(textHeight(name) / GRID_SIZE) / 2) * 2);
            document.getElementById("slider_module_x").value = ModuleTool.size.x;
            return;
        }

        if (ModuleTool.size.y >= ModuleTool.size.x && textHeight(name) > ModuleTool.size.y * GRID_SIZE) {
            ModuleTool.changeChipSizeY(Math.ceil(Math.ceil(textHeight(name) / GRID_SIZE) / 2) * 2);
            document.getElementById("slider_module_y").value = ModuleTool.size.y;
            return;
        }
    },

    changeChipSizeX(value) {
        let newX = parseInt(value);

        if (ModuleTool.size.y * GRID_SIZE < textHeight(ModuleTool.name) && newX * GRID_SIZE < textHeight(ModuleTool.name)) newX = Math.ceil(Math.ceil(textHeight(ModuleTool.name) / GRID_SIZE) / 2) * 2;
        newX = Math.max(newX, ModuleTool.getMinWidth());

        if (newX < ModuleTool.size.x) {
            for (let i = newX / 2; i < ModuleTool.size.x / 2; i++) {
                delete ModuleTool.spots[Direction.UP][i];
                delete ModuleTool.spots[Direction.UP][-i];

                delete ModuleTool.spots[Direction.DOWN][i];
                delete ModuleTool.spots[Direction.DOWN][-i];
            }
        }

        if (newX > ModuleTool.size.x) {
            for (let i = ModuleTool.size.x / 2; i < newX / 2; i++) {
                ModuleTool.spots[Direction.UP][i] = null;
                ModuleTool.spots[Direction.UP][-i] = null;

                ModuleTool.spots[Direction.DOWN][i] = null;
                ModuleTool.spots[Direction.DOWN][-i] = null;
            }
        }

        ModuleTool.size.x = newX;
        document.getElementById("slider_module_x").value = ModuleTool.size.x;
    },

    changeChipSizeY(value) {
        let newY = parseInt(value);

        if (ModuleTool.size.x * GRID_SIZE < textHeight(ModuleTool.name) && newY * GRID_SIZE < textHeight(ModuleTool.name)) newY = Math.ceil(Math.ceil(textHeight(ModuleTool.name) / GRID_SIZE) / 2) * 2;
        newY = Math.max(newY, ModuleTool.getMinHeight());

        if (newY < ModuleTool.size.y) {
            for (let i = newY / 2; i < ModuleTool.size.y / 2; i++) {
                delete ModuleTool.spots[Direction.LEFT][i];
                delete ModuleTool.spots[Direction.LEFT][-i];

                delete ModuleTool.spots[Direction.RIGHT][i];
                delete ModuleTool.spots[Direction.RIGHT][-i];
            }
        }

        if (newY > ModuleTool.size.y) {
            for (let i = ModuleTool.size.y / 2; i < newY / 2; i++) {
                ModuleTool.spots[Direction.LEFT][i] = null;
                ModuleTool.spots[Direction.LEFT][-i] = null;

                ModuleTool.spots[Direction.RIGHT][i] = null;
                ModuleTool.spots[Direction.RIGHT][-i] = null;
            }
        }

        ModuleTool.size.y = newY;
        document.getElementById("slider_module_y").value = ModuleTool.size.y;
    },

    save: function () {
        if (ModuleTool.name == "") {
            alert("Module name cannot be empty!");
            return;
        }

        circuitJSON = mainCircuit.toJSON();
        mainCircuit.reset();

        let iPinsData = {};
        let oPinsData = {};

        for (const data of ModuleTool.getSpotData()) {
            if (data.pin == null) continue;

            let offset;
            if (data.direction == Direction.LEFT) {
                offset = { x: -ModuleTool.size.x / 2, y: data.index };
            }
            if (data.direction == Direction.RIGHT) {
                offset = { x: ModuleTool.size.x / 2, y: data.index };
            }
            if (data.direction == Direction.UP) {
                offset = { x: data.index, y: -ModuleTool.size.y / 2 };
            }
            if (data.direction == Direction.DOWN) {
                offset = { x: data.index, y: ModuleTool.size.y / 2 };
            }

            switch (data.pin.type) {
                case WirePoint.INPUT_PIN:
                    {
                        iPinsData[data.pin.name] = { "offset": offset };
                        break;
                    }
                case WirePoint.OUTPUT_PIN:
                    {
                        oPinsData[data.pin.name] = { "offset": offset, "state": mainCircuit.chips.find(ch => ch.code == BuiltinChipCode.OUTPUT && ch.name == data.pin.name).getInputState("In") };
                        break;
                    }
            }
        }

        let writer = createWriter(ModuleTool.name.replaceAll(" ", "_") + ".module");
        let data = { "size": ModuleTool.size, "name": ModuleTool.name, "iPinsData": iPinsData, "oPinsData": oPinsData, "circuit": mainCircuit.toJSON() };

        writer.write(JSON.stringify(data));
        writer.close();

        mainCircuit.load(circuitJSON);
        addModuleToList(data);
    }
}