async function loadArmorRecipes() {
    try {
        const response = await fetch("armor1.json");
        if (!response.ok) throw new Error("Failed to load armor1.json");
        const jsonData = await response.json();
        return jsonData.WeaponsCrafting.Recipes["Tier 1"]; // Pulling only Tier 1 for now
    } catch (error) {
        console.error("❌ Error loading recipes:", error);
        return {};
    }
}

async function runCrafting() {
    console.log("🚀 Running Armor Crafting...");
    const inventoryText = document.getElementById("inventory").value.split("\n"); // Get inventory input

    let standardizedInventory = inventoryText.reduce((acc, line) => {
        const match = line.match(/^(.+?)\((\d+)\)$/);
        if (match) acc[match[1].trim()] = parseInt(match[2], 10);
        return acc;
    }, {}); 

    let recipes = await loadArmorRecipes();
    let craftableItems = {};

    for (let recipeName in recipes) {
        let materials = recipes[recipeName]["materials"];
        let maxCraftCount = Infinity;

        for (let material of materials) {
            let [itemName, requiredCount] = material.match(/^(.+?)\((\d+)\)$/).slice(1, 3);
            requiredCount = parseInt(requiredCount, 10);
            let availableCount = standardizedInventory[itemName] || 0;

            maxCraftCount = Math.min(maxCraftCount, Math.floor(availableCount / requiredCount));
        }

        if (maxCraftCount > 0) craftableItems[recipeName] = maxCraftCount;
    }

    document.getElementById("output").textContent = JSON.stringify(craftableItems, null, 2);
    console.log("✅ Crafting Results:", craftableItems);
}
