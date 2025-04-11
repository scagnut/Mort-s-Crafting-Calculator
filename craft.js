// Optimized Crafting System with JSON Recipe File Handling
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
                const response = await fetch(`https://scagnut.github.io/Mort-s-Crafting-Calculator/${file}`);
                if (!response.ok) throw new Error(`Failed to load ${file}`);
                const jsonData = await response.json(); // Parse JSON instead of text

                for (let category in jsonData) {
                    let tierData = jsonData[category].Recipes;

                    for (let tier in tierData) {
                        let recipes = tierData[tier];

                        for (let recipeName in recipes) {
                            let rawMaterials = recipes[recipeName];
                            if (rawMaterials.length > 0) {
                                let materials = {};

                                // Convert ["Item(2)", "Item(1)"] into { "Item": 2, "Item2": 1 }
                                for (let entry of rawMaterials) {
                                    let match = entry.match(/(.+?)\((\d+)\)/);
                                    if (match) {
                                        materials[match[1].trim()] = parseInt(match[2]);
                                    }
                                }

                                allRecipes[recipeName] = materials;
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`❌ Error loading recipe file: ${file}`, error);
            }
        }

        console.log("✅ Fixed Parsed Recipes:", allRecipes); // Debugging check
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
        
        console.log("✅ Fixed Filtered Recipes:", filteredRecipes); // Debugging check
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

    // Ensure file names reference JSON instead of TXT
    selectedFiles = selectedFiles.map(file => file.replace(".txt", ".json"));

    console.log("✅ Checking Recipe Files:", selectedFiles); // Debugging check

    let craftingSystem = new CraftingSystem(rawInventory);
    let recipes = await craftingSystem.parseRecipeFiles(selectedFiles);
    let filteredRecipes = craftingSystem.filterRecipesByTier(recipes, selectedTiers);
    let craftingResults = craftingSystem.generateCraftingReport(filteredRecipes);

    console.log("✅ Final Crafting Results:", craftingResults); // Debugging check

    document.getElementById("output").textContent = craftingResults && Object.keys(craftingResults).length
        ? JSON.stringify(craftingResults, null, 2)
        : "❌ No items craftable with the current inventory.";
}
