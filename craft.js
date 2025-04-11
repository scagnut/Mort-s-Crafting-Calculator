// Crafting System Class (includes inventory parsing and recipe matching)
class CraftingSystem {
    constructor(inventory) {
        this.inventory = this.parseInventory(inventory);
        this.recipes = this.getRecipes();  // Placeholder for recipes
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

    // Placeholder for getting recipes, could be replaced with JSON or file-based system
    getRecipes() {
        return {
            "Potion of Strength": {
                "Herb": 2,
                "Water": 1
            },
            "Healing Potion": {
                "Herb": 1,
                "Water": 2
            }
        };
    }

    getCraftableItems() {
        let craftableItems = {};
        for (let recipeName in this.recipes) {
            let recipe = this.recipes[recipeName];
            let maxCount = Infinity;

            // Check how many times each recipe can be crafted
            for (let item in recipe) {
                let requiredAmount = recipe[item];
                let availableAmount = this.inventory[item] || 0;
                maxCount = Math.min(maxCount, Math.floor(availableAmount / requiredAmount));
            }

            if (maxCount > 0) {
                craftableItems[recipeName] = maxCount;
            }
        }
        return craftableItems;
    }

    getInventoryReport() {
        let report = [];
        for (let item in this.inventory) {
            report.push(`✅ ${item} (Available: ${this.inventory[item]})`);
        }
        return `📜 **Inventory Report**\n${report.join("\n")}`;
    }

    getCraftingReport() {
        let craftableItems = this.getCraftableItems();
        if (Object.keys(craftableItems).length === 0) {
            return "No craftable items found.";
        }

        let report = [];
        for (let item in craftableItems) {
            report.push(`${item}: Can craft ${craftableItems[item]} times`);
        }
        return `📜 **Crafting Report**\n${report.join("\n")}`;
    }
}

// Function to trigger crafting
function checkCrafting() {
    let rawInventory = document.getElementById("inventory").value;
    let craftingSystem = new CraftingSystem(rawInventory);

    // Display results: Inventory Report + Crafting Report
    document.getElementById("result").textContent = `
        ${craftingSystem.getInventoryReport()}
        \n\n
        ${craftingSystem.getCraftingReport()}
    `;
}
