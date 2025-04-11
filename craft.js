// Updated Crafting System with Item Filtering
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
                
                // Ignore certain items
                if (item !== "Violent Essence" && item !== "Vigor Essence") {
                    inventory[item] = quantity;
                }
            }
        });
        return inventory;
    }

    craftItem(recipe) {
        let missingItems = [];
        let craftedItems = [];

        for (let item in recipe) {
            let needed = recipe[item];
            let available = this.inventory[item] || 0;

            if (available < needed) {
                missingItems.push(`${item} (Missing: ${needed - available})`);
            } else {
                this.inventory[item] -= needed;
                craftedItems.push(`${item} (Used: ${needed}, Left: ${this.inventory[item]})`);
            }
        }

        if (missingItems.length > 0) {
            return `❌ Not enough materials! Missing:\n${missingItems.join("\n")}`;
        } else {
            return `✅ Crafting Successful!\nUsed:\n${craftedItems.join("\n")}`;
        }
    }
}

// Example Usage
let rawInventory = `[04:34] Violent Essence(215)\n[04:34] Vigor Essence(50)\n[04:34] Helgrammites(5)\n[04:34] Cricket(16)`;
let craftingSystem = new CraftingSystem(rawInventory);
let recipe = { "Helgrammites": 3, "Cricket": 10 };

console.log(craftingSystem.craftItem(recipe));
