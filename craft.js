// Optimized Crafting System with JSON Recipe File Handling & Debugging
class CraftingSystem {
    constructor(inventory) {
        this.inventory = this.parseInventory(inventory);
    }

    parseInventory(rawData) {
        let inventory = {};
        let lines = rawData.split("\n");

        for (let line of lines) {
            // Remove timestamps like "[05:51]" automatically
            line = line.replace(/\[\d{2}:\d{2}\] /, "").trim();

            let match = line.match(/(.+?)\(?(\d+)?\)?$/); // Extract item name + quantity
            if (match) {
                let item = match[1].trim().toLowerCase(); // Standardize name
                let quantity = parseInt(match[2]) || 1; // Default to 1 if missing
                
                inventory[item] = (inventory[item] || 0) + quantity; // Aggregate items
            }
        }

        console.log("✅ Standardized Inventory:", JSON.stringify(inventory, null, 2)); // Debugging check
        window.debugInventory = inventory; // Store globally for debugging
        return inventory;
    }

    async parseRecipeFiles(selectedFiles) {
        let allRecipes = {};
        for (let file of selectedFiles) {
            try {
                const response = await fetch(`https://scagnut.github.io/Mort-s-Crafting-Calculator/${file}`);
                if (!response.ok) throw new Error(`Failed to load ${file}`);
                const jsonData = await response.json(); // Parse JSON

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
                                        materials[match[1].trim().toLowerCase()] = parseInt(match[2]);
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

        console.log("✅ Fixed Parsed Recipes Structure:", JSON.stringify(allRecipes, null, 2)); // Debugging check
        window.debugRecipes = allRecipes; // Store globally for manual debugging
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

        console.log("✅ Fixed Filtered Recipes:", JSON.stringify(filteredRecipes, null, 2)); // Debugging check
        window.debugFilteredRecipes = filteredRecipes; // Store globally for debugging
        return filteredRecipes;
    }

    generateCraftingReport(recipes) {
        let craftableItems = {};
        let standardizedInventory = {};

        // Standardize inventory item names
        for (let item in this.inventory) {
            standardizedInventory[item.toLowerCase().trim()] = this.inventory[item];
        }

        for (let recipeName in recipes) {
            const materials = recipes[recipeName];
            let maxCraftCount = Infinity;

            for (let item in materials) {
                let normalizedItem = item.toLowerCase().trim();
                let closestMatch = Object.keys(standardizedInventory).find(invItem =>
                    invItem.includes(normalizedItem) || normalizedItem.includes(invItem)
                );

                let available = closestMatch ? standardizedInventory[closestMatch] : 0;
                let required = materials[normalizedItem] || 0;

                maxCraftCount = Math.min(maxCraftCount, Math.floor(available / required));
            }

            if (maxCraftCount > 0) {
                craftableItems[recipeName] = maxCraftCount;
            }
        }

        console.log("✅ Fixed Crafting Report:", JSON.stringify(craftableItems, null, 2)); // Debugging check
        window.debugCraftingReport = craftableItems; // Store globally for debugging
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

    console.log("✅ Recipe Files Selected:", selectedFiles); // Debugging check

    let craftingSystem = new CraftingSystem(rawInventory);
    let recipes = await craftingSystem.parseRecipeFiles(selectedFiles);
    let filteredRecipes = craftingSystem.filterRecipesByTier(recipes, selectedTiers);
    let craftingResults = craftingSystem.generateCraftingReport(filteredRecipes);

    document.getElementById("output").innerHTML = `
    <h3>✅ Debug Recipes:</h3><pre>${JSON.stringify(debugRecipes, null, 2)}</pre>
    <h3>✅ Debug Filtered Recipes:</h3><pre>${JSON.stringify(debugFilteredRecipes, null, 2)}</pre>
    <h3>✅ Debug Inventory:</h3><pre>${JSON.stringify(debugInventory, null, 2)}</pre>
    <h3>✅ Debug Crafting Report:</h3><pre>${JSON.stringify(debugCraftingReport, null, 2)}</pre>
`;

    document.getElementById("output").textContent = craftingResults && Object.keys(craftingResults).length
        ? JSON.stringify(craftingResults, null, 2)
        : "❌ No items craftable with the current inventory.";
}
