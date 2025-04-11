// Function to parse the inventory input
function parseInventory(rawInventory) {
    const inventory = {};
    const lines = rawInventory.trim().split('\n');
    for (let line of lines) {
        const parts = line.split(']');
        let itemData = parts.length > 1 ? parts[1].trim() : line.trim();
        const match = itemData.match(/(.+?)\((\d+)\)/);
        if (match) {
            const itemName = match[1].trim();
            const quantity = parseInt(match[2]);
            inventory[itemName] = quantity;
        }
    }
    return inventory;
}

// Function to parse a recipe file
async function parseRecipeFile(filePath) {
    const response = await fetch(filePath);
    const text = await response.text();
    const lines = text.split('\n');
    const tiers = {};
    const recipes = {};

    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith("#")) continue;

        if (line.includes("Tier") && line.includes("Level") && line.includes(",")) {
            const parts = line.split(',');
            if (parts.length === 4) {
                const tierName = parts[0].trim();
                const level = parseInt(parts[1].trim().replace("Level ", ""));
                const color = parts[2].trim();
                const craftingLevel = parseInt(parts[3].trim().replace("Level ", ""));
                tiers[tierName] = { level, color, craftingLevel };
            }
        } else if (line.includes(",")) {
            const parts = line.split(',');
            const recipeName = parts[0].trim();
            const materials = {};
            for (let i = 1; i < parts.length; i++) {
                const material = parts[i].trim();
                const match = material.match(/(.+?)\((\d+)\)/);
                if (match) {
                    const itemName = match[1].trim();
                    if (itemName === "Violent Essence" || itemName === "Vigor Essence") continue;
                    const quantity = parseInt(match[2]);
                    materials[itemName] = quantity;
                }
            }
            if (Object.keys(materials).length > 0) {
                recipes[recipeName] = materials;
            }
        }
    }

    return { tiers, recipes };
}

// Function to parse selected files
async function parseFiles(selectedFiles) {
    const allTiers = {};
    const allRecipes = {};
    for (let file of selectedFiles) {
        const { tiers, recipes } = await parseRecipeFile(file);
        Object.assign(allTiers, tiers);
        Object.assign(allRecipes, recipes);
    }
    return { allTiers, allRecipes };
}

// Function to filter recipes based on selected tiers
function filterByTiers(recipes, selectedTiers) {
    const filteredRecipes = {};
    for (let recipeName in recipes) {
        for (let tier of selectedTiers) {
            if (recipeName.includes(tier)) {
                filteredRecipes[recipeName] = recipes[recipeName];
                break;
            }
        }
    }
    return filteredRecipes;
}

// Function to generate crafting report
function craftingReport(recipes, inventory) {
    const craftableItems = {};
    for (let recipeName in recipes) {
        const materials = recipes[recipeName];
        let maxCount = Infinity;
        for (let item in materials) {

::contentReference[oaicite:18]{index=18}
 
