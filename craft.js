// Load Armor Recipes from JSON
async function loadArmorRecipes() {
    try {
        const response = await fetch("armor1.json");
        if (!response.ok) throw new Error("Failed to load armor1.json");
        const jsonData = await response.json();
        return jsonData.WeaponsCrafting.Recipes["Tier 1"]; // Pull Tier 1 recipes
    } catch (error) {
        console.error("❌ Error loading recipes:", error);
        return {};
    }
}

// Ensure `runCrafting()` is globally accessible
window.runCrafting = async function() {
    console.log("🚀 Running Armor Crafting...");

    // Get inventory input from user
    const inventoryText = document.getElementById("inventory").value.split("\n");

    // Convert inventory items to standardized format
    let standardizedInventory = inventoryText.reduce((acc, line) => {
        const match = line.match(/^(.+?)\((\d+)\)$/);
        if (match) acc[match[1].trim().toLowerCase()] = parseInt(match[2], 10);
        return acc;
    }, {}); 

    let recipes = await loadArmorRecipes();
    let craftableItems = {};

    // Process each recipe and calculate possible craft count
    for (let recipeName in recipes) {
        let materials = recipes[recipeName]["materials"];
        let maxCraftCount = Infinity;

        for (let material of materials) {
            let [itemName, requiredCount] = material.match(/^(.+?)\((\d+)\)$/).slice(1, 3);
            requiredCount = parseInt(requiredCount, 10);
            let availableCount = standardizedInventory[itemName.toLowerCase()] || 0;

            maxCraftCount = Math.min(maxCraftCount, Math.floor(availableCount / requiredCount));
        }

        if (maxCraftCount > 0) craftableItems[recipeName] = maxCraftCount;
    }

    // Display crafting results
    document.getElementById("output").textContent = JSON.stringify(craftableItems, null, 2);
    console.log("✅ Crafting Results:", craftableItems);
};
