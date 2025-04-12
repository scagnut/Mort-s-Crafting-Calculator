from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# Global variables to store selected files and tiers
selected_files = {"armor.txt": True, "weapons.txt": True, "jewel.txt": True, "alchemy.txt": True}
selected_tiers = {"Tier 1": True, "Tier 2": True, "Tier 3": True, "Tier 4": True, "Tier 5": True, "Tier 6": True}

# Function to parse tiers and recipes from a text file
def parse_armor_file(file_path):
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
                        level = parts[1].strip().replace("Level ", "")
                        color = parts[2].strip()
                        crafting_level = parts[3].strip().replace("Level ", "")

                        tiers[tier_name] = {
                            "level": int(level),
                            "color": color,
                            "crafting_level": int(crafting_level),
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
                            quantity = int(quantity.replace(')', '').strip())
                            materials[item_name] = quantity
                    if not materials:
                        continue
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
            file_tiers, file_recipes = parse_armor_file(file)
            tiers.update(file_tiers)
            recipes.update(file_recipes)
    return tiers, recipes

# Function to filter recipes based on selected tiers
def filter_by_tiers(recipes, selected_tiers):
    filtered_recipes = {}
    for recipe_name, materials in recipes.items():
        for tier in selected_tiers:
            if selected_tiers[tier] and tier in recipe_name:
                filtered_recipes[recipe_name] = materials
    return filtered_recipes

# Function to generate crafting report
def crafting_report(tiers, recipes, inventory):
    craftable_items = {}
    for recipe_name, materials in recipes.items():
        max_count = float("inf")
        for item, required_amount in materials.items():
            available_amount = inventory.get(item, 0)
            max_count = min(max_count, available_amount // required_amount)
        if max_count > 0:
            craftable_items[recipe_name] = max_count
    return craftable_items

# Function to parse inventory from user input
def parse_inventory(raw_inventory):
    inventory = {}
    for line in raw_inventory.strip().split('\n'):
        parts = line.split(']')
        if len(parts) > 1:
            item_data = parts[1].strip()
        else:
            item_data = line.strip()
        if '(' in item_data and ')' in item_data:
            item_name, quantity = item_data.split('(')
            item_name = item_name.strip()
            quantity = int(quantity.replace(')', '').strip())
            inventory[item_name] = quantity
    return inventory

# Flask Routes
@app.route('/')
def index():
    return render_template("index.html")

@app.route('/craft', methods=['POST'])
def craft():
    raw_inventory = request.form["inventory"]
    inventory = parse_inventory(raw_inventory)

    tiers, recipes = parse_files(selected_files)
    filtered_recipes = filter_by_tiers(recipes, selected_tiers)
    report = crafting_report(tiers, filtered_recipes, inventory)

    return jsonify({"craftable_items": report})

if __name__ == '__main__':
    app.run(debug=True)
