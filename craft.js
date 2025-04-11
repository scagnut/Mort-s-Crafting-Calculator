// Core Crafting System
class CraftingSystem {
    constructor(inventory) {
        this.inventory = this.parseInventory(inventory);
    }

    parseInventory(rawData) {
        let inventory = {};
        rawData.split("\n").forEach(line => {
            let match = line.match(/\[.*?\] (.+?)\((\d+)\)/);
            if (match) {
                let item = match[1].trim();
                let quantity = parseInt(match[2]);
                inventory[item] = quantity;
            }
        });
        return inventory;
    }

    canCraft(recipe) {
        for (let item in recipe) {
            if (!this.inventory[item] || this.inventory[item] < recipe[item]) {
                return false;
            }
        }
        return true;
    }
}

// Example Usage
let rawInventory = `08:16] Helgrammites(5)
[08:16] Cricket(16)
[08:16] Worm(71)`;

let craftingSystem = new CraftingSystem(rawInventory);
let recipe = { "Helgrammites": 3, "Cricket": 10 };

console.log(craftingSystem.canCraft(recipe)); // Output: true
