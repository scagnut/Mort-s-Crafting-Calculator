// Optimized Crafting System - Fully Fixed
class CraftingSystem {
    constructor(inventory) {
        this.inventory = this.parseInventory(inventory);
    }

    parseInventory(rawData) {
        let inventory = {};
        let lines = rawData.split("\n");

        for (let line of lines) {
            let match = line.match(/\[.*?\] (.+?)\((\d+)\)/);
            if (match) {
                let item = match[1].trim();
                let quantity = parseInt(match[2]);

                // Exclude unwanted items and headers
                if (!["Items in Craft Vault", "Violent Essence", "Vigor Essence"].includes(item)) {
                    inventory[item] = quantity;
                }
            }
        }

        console.log("✅ Parsed Inventory:", inventory); // Debugging check
        return inventory;
    }

    async parseRecipeFiles(selectedFiles) {
        let allRecipes = {};
        for (let file of selectedFiles) {
            try {
                const response = await fetch(file);
                if (!response.ok) throw new Error(`Failed to load ${file}`);
                const text = await response.text();
                const lines = text.split("\n");

                for (let line of lines) {
                    let parts = line.split(",");
                    if (parts.length > 1) {
                        let recipeName = parts[0].trim();
                        let materials = {};

                        for (let i = 1; i < parts.length; i++) {
                            let materialMatch = parts[i].trim().match(/(.+?)\((\d+)\)/);
                            if (materialMatch) {
                                let itemName = materialMatch[1].trim();
                                let quantity = parseInt(materialMatch[2]);

                                if (!["Violent Essence", "Vigor Essence"].includes(itemName)) {
                                    materials[itemName] = quantity;
                                }
                            }
                        }

                        if (Object.keys(materials).length > 0) {
                            allRecipes[recipeName] = materials;
                        }
                    }
                }
            } catch (error) {
                console.error(`❌ Error loading recipe file: ${file}`, error);
            }
        }

        console.log("✅ Parsed Recipes:", allRecipes); // Debugging check
        return allRecipes;
    }

    filterRecipesByTier(recipes, selectedTiers) {
        let filteredRecipes = {};
        for (let recipeName in recipes) {
            for (let tier of selectedTiers) {
                if (recipeName.includes(tier)) {
                    filteredRecipes[recipeName] = recipes[recipeName];
                    break;
                }
            }
        }
        console.log("✅ Filtered Recipes:", filteredRecipes); // Debugging check
        return filteredRecipes;
    }

    generateCraftingReport(recipes) {
        let craftableItems = {};
        for (let recipeName in recipes) {
            const materials = recipes[recipeName];
            let maxCraftCount = Infinity;

            for (let item in materials) {
                let available = this.inventory[item] || 0;
                let required = materials[item];

                maxCraftCount = Math.min(maxCraftCount, Math.floor(available / required));
            }

            if (maxCraftCount > 0) {
                craftableItems[recipeName] = maxCraftCount;
            }
        }

        console.log("✅ Crafting Report:", craftableItems); // Debugging check
        return craftableItems;
    }
}

// Function to run crafting calculation
async function runCraftingCalculation() {
    console.log("🚀 Running crafting calculation..."); // Debugging check

    let rawInventory = document.getElementById("inventory").value;
    let selectedFiles = Array.from(document.querySelectorAll(".file-checkbox:checked")).map(el => el.value);
    let selectedTiers = Array.from(document.querySelectorAll(".tier-checkbox:checked")).map(el => el.value);

    let craftingSystem = new CraftingSystem(rawInventory);
    let recipes = await craftingSystem.parseRecipeFiles(selectedFiles);
    let filteredRecipes = craftingSystem.filterRecipesByTier(recipes, selectedTiers);
    let craftingResults = craftingSystem.generateCraftingReport(filteredRecipes);

    console.log("✅ Final Crafting Results:", craftingResults); // Debugging check

    document.getElementById("output").textContent = craftingResults && Object.keys(craftingResults).length
        ? JSON.stringify(craftingResults, null, 2)
        : "❌ No items craftable with the current inventory.";
}
