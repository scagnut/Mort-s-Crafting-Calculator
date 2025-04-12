from flask import Flask, request, jsonify, render_template
import json  # Needed to parse JSON from the frontend

app = Flask(__name__, template_folder="templates")  # Explicitly define templates folder

# Function to parse inventory from user input
def parse_inventory(raw_inventory):
    inventory = {}
    for line in raw_inventory.strip().split('\n'):
        parts = line.split(']')
        item_data = parts[1].strip() if len(parts) > 1 else line.strip()
        if '(' in item_data and ')' in item_data:
            item_name, quantity = item_data.split('(')
            inventory[item_name.strip()] = int(quantity.replace(')', '').strip())
    return inventory

# Function to parse tiers and recipes from a text file
def parse_file(file_path):
    tiers = {}
    recipes = {}
    try:
        with open(file_path, 'r') as file:
            for line in file:
                line = line.strip()
                if not line or line.startswith("#"):  # Skip empty lines or comments
                    continue
                
                # Parse tiers (e.g., "Tier 1 , Level 1, Green , Level 20")
                if "Tier" in line and "," in line and "Level" in line:
                    parts = line.split(',')
                    if len(parts) == 4:
                        tier_name = parts[0].strip()
                        tiers[tier_name] = {
                            "level": int(parts[1].strip().replace("Level ", "")),
                            "color": parts[2].strip(),
                            "crafting_level": int(parts[3].strip().replace("Level ", ""))
                        }
                
                # Parse recipes
                elif "," in line:
                    parts = line.split(',')
                    recipe_name = parts[0].strip()
                    materials = {}
                    for material in parts[1:]:
                        material = material.strip()
                        if '(' in material and ')' in material:
                            item_name, quantity = material.split('(')
                            item_name = item_name.strip()
                            if item_name in ["Violent Essence", "Vigor Essence"]:  # Skip unnecessary materials
                                continue
                            materials[item_name] = int(quantity.replace(')', '').strip())
                    if materials:
                        recipes[recipe_name] = materials
    except FileNotFoundError:
        print(f"Error: The file {file_path} was not found.")
    return tiers, recipes

# Function to parse selected files and tiers
def parse_files(selected_files):
    tiers = {}
    recipes = {}
    for file, include in selected_files.items():
        if include:
            file_tiers, file_recipes = parse_file(file)
            tiers.update(file_tiers)
            recipes.update(file_recipes)
    return tiers, recipes

# Function to filter recipes by selected tiers
def filter_by_tiers(recipes, selected_tiers):
    filtered_recipes = {recipe: materials for recipe, materials in recipes.items()
                        if any(tier in recipe for tier, include in selected_tiers.items() if include)}
    return filtered_recipes

# Function to generate crafting report **sorted by armor type and tier**
def crafting_report(tiers, recipes, inventory):
    craftable_items = {}

    for recipe_name, materials in recipes.items():
        max_count = float("inf")

        for item, required_amount in materials.items():
            available_amount = inventory.get(item, 0)
            max_count = min(max_count, available_amount // required_amount)

        if max_count > 0:
            # Identify armor type and tier
            armor_type = "Armor" if "armor" in recipe_name.lower() else "Other"
            tier = next((t for t in tiers if t in recipe_name), "Unknown Tier")

            # Group and sort items
            if armor_type not in craftable_items:
                craftable_items[armor_type] = {}
            if tier not in craftable_items[armor_type]:
                craftable_items[armor_type][tier] = {}

            craftable_items[armor_type][tier][recipe_name] = max_count

    # Sort results by Tier Order
    for armor_type in craftable_items:
        craftable_items[armor_type] = dict(sorted(craftable_items[armor_type].items(),
                                                  key=lambda t: int(t[0].split()[1]) if "Tier" in t[0] else 999))

    return craftable_items

# Flask Routes
@app.route('/')
def index():
    return render_template("index.html")

@app.route('/craft', methods=['POST'])
def craft():
    raw_inventory = request.form.get("inventory", "")
    selected_files = json.loads(request.form.get("selectedFiles", "{}"))
    selected_tiers = json.loads(request.form.get("selectedTiers", "{}"))

    inventory = parse_inventory(raw_inventory)
    tiers, recipes = parse_files(selected_files)
    filtered_recipes = filter_by_tiers(recipes, selected_tiers)
    report = crafting_report(tiers, filtered_recipes, inventory)

    return jsonify({"craftable_items": report})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8080, debug=False)  # Render requires host=0.0.0.0 and port 8080
