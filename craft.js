// Optimized Crafting System (No Recipe Box, Inventory-Only Processing)
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
                
                // Exclude unwanted items
                if (item !== "Violent Essence" && item !== "Vigor Essence") {
                    inventory[item] = quantity;
                }
            }
        });
        return inventory;
    }

    getInventoryReport() {
        let report = [];
        for (let item in this.inventory) {
            report.push(`✅ ${item} (Available: ${this.inventory[item]})`);
        }
        return `📜 **Inventory Report**\n${report.join("\n")}`;
    }
}

// Example Usage
let rawInventory = `[04:34] Helgrammites(5)\n[04:34] Cricket(16)\n[04:34] Spinner(16)`;
let craftingSystem = new CraftingSystem(rawInventory);

console.log(craftingSystem.getInventoryReport());
