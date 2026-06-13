import { Pool } from 'pg';
import dotenv from 'dotenv';


dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const categoryImages: { [key: string]: string } = {
  'Beverages': 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60',
  'Bakery & Pastry': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
  'Main Course': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
  'Snacks': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60',
  'Desserts': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop&q=60',
  'South Indian': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60',
  'North Indian': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60',
  'Fast Food': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
  'Healthy Options': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60'
};

const items = [
  { "name": "Masala Chai", "category": "Beverages", "price": 65, "tax": 5, "unit": "PIECE", "description": "Classic Indian spiced tea brewed with ginger, cardamom and fresh milk", "imageQuery": "masala chai indian spiced tea" },
  { "name": "Cold Coffee", "category": "Beverages", "price": 120, "tax": 5, "unit": "PIECE", "description": "Chilled blended coffee with milk and a hint of vanilla, topped with cream", "imageQuery": "cold coffee blended drink" },
  { "name": "Lassi", "category": "Beverages", "price": 90, "tax": 5, "unit": "PIECE", "description": "Thick and creamy yogurt-based drink, available sweet or salted", "imageQuery": "lassi yogurt drink indian" },
  { "name": "Cappuccino", "category": "Beverages", "price": 150, "tax": 5, "unit": "PIECE", "description": "Espresso with steamed milk foam, served in a classic Italian style", "imageQuery": "cappuccino coffee foam" },
  { "name": "Espresso", "category": "Beverages", "price": 100, "tax": 5, "unit": "PIECE", "description": "Strong concentrated coffee shot, perfect for a quick caffeine kick", "imageQuery": "espresso coffee shot" },
  { "name": "Latte", "category": "Beverages", "price": 160, "tax": 5, "unit": "PIECE", "description": "Espresso with velvety steamed milk and a thin layer of foam", "imageQuery": "latte coffee steamed milk" },
  { "name": "Mango Lassi", "category": "Beverages", "price": 110, "tax": 5, "unit": "PIECE", "description": "Refreshing blend of ripe Alphonso mangoes and chilled yogurt", "imageQuery": "mango lassi orange drink" },
  { "name": "Green Tea", "category": "Beverages", "price": 80, "tax": 5, "unit": "PIECE", "description": "Delicate Japanese green tea, lightly brewed for a calming experience", "imageQuery": "green tea cup hot" },
  { "name": "Strawberry Milkshake", "category": "Beverages", "price": 140, "tax": 5, "unit": "PIECE", "description": "Thick strawberry milkshake made with fresh berries and vanilla ice cream", "imageQuery": "strawberry milkshake pink" },
  { "name": "Chocolate Milkshake", "category": "Beverages", "price": 150, "tax": 5, "unit": "PIECE", "description": "Indulgent chocolate milkshake with whipped cream and chocolate syrup", "imageQuery": "chocolate milkshake cream" },
  { "name": "Fresh Lime Soda", "category": "Beverages", "price": 70, "tax": 5, "unit": "PIECE", "description": "Zesty fresh lime squeezed into sparkling soda with black salt", "imageQuery": "lime soda fresh drink" },
  { "name": "Watermelon Juice", "category": "Beverages", "price": 90, "tax": 5, "unit": "PIECE", "description": "Cold-pressed fresh watermelon juice, naturally sweet and hydrating", "imageQuery": "watermelon juice fresh red" },
  { "name": "Iced Americano", "category": "Beverages", "price": 130, "tax": 5, "unit": "PIECE", "description": "Double espresso over ice with cold water, bold and refreshing", "imageQuery": "iced americano coffee black" },
  { "name": "Caramel Macchiato", "category": "Beverages", "price": 180, "tax": 5, "unit": "PIECE", "description": "Layers of vanilla syrup, milk, espresso and caramel drizzle", "imageQuery": "caramel macchiato coffee layered" },
  { "name": "Mocha", "category": "Beverages", "price": 170, "tax": 5, "unit": "PIECE", "description": "Espresso blended with rich chocolate sauce and steamed milk", "imageQuery": "mocha coffee chocolate" },
  { "name": "Hibiscus Iced Tea", "category": "Beverages", "price": 120, "tax": 5, "unit": "PIECE", "description": "Tangy hibiscus flower tea served chilled with honey and lemon", "imageQuery": "hibiscus iced tea pink" },
  { "name": "Turmeric Latte", "category": "Beverages", "price": 140, "tax": 5, "unit": "PIECE", "description": "Golden milk latte with turmeric, black pepper and coconut milk", "imageQuery": "turmeric golden latte" },
  { "name": "Blue Pea Lemonade", "category": "Beverages", "price": 150, "tax": 5, "unit": "PIECE", "description": "Color-changing butterfly pea flower lemonade, both stunning and delicious", "imageQuery": "blue pea flower lemonade purple" },
  { "name": "Rose Milk", "category": "Beverages", "price": 80, "tax": 5, "unit": "PIECE", "description": "Chilled milk sweetened with rose syrup, a nostalgic Indian classic", "imageQuery": "rose milk pink sweet drink" },
  { "name": "Coconut Water", "category": "Beverages", "price": 70, "tax": 5, "unit": "PIECE", "description": "Fresh tender coconut water served chilled, naturally electrolyte-rich", "imageQuery": "coconut water fresh tropical" },
  { "name": "Alphonso Mango Frappuccino", "category": "Beverages", "price": 200, "tax": 5, "unit": "PIECE", "description": "Frozen blend of Alphonso mangoes with cold coffee and cream", "imageQuery": "mango frappuccino frozen coffee" },
  { "name": "Paan Mojito", "category": "Beverages", "price": 130, "tax": 5, "unit": "PIECE", "description": "Refreshing mocktail with betel leaf, mint, lime and rose water", "imageQuery": "paan mojito green mocktail" },
  { "name": "Filter Coffee", "category": "Beverages", "price": 75, "tax": 5, "unit": "PIECE", "description": "Traditional South Indian filter coffee with chicory, served hot in a tumbler", "imageQuery": "filter coffee south indian tumbler" },
  { "name": "Almond Butter Smoothie", "category": "Beverages", "price": 180, "tax": 5, "unit": "PIECE", "description": "Protein-rich smoothie with almond butter, banana and oat milk", "imageQuery": "almond butter smoothie healthy" },
  { "name": "Kesar Milk", "category": "Beverages", "price": 100, "tax": 5, "unit": "PIECE", "description": "Warm saffron milk with cardamom and sugar, a royal Indian beverage", "imageQuery": "saffron kesar milk golden" },

  { "name": "Butter Croissant", "category": "Bakery & Pastry", "price": 80, "tax": 18, "unit": "PIECE", "description": "Flaky, buttery French croissant baked fresh every morning", "imageQuery": "butter croissant flaky pastry" },
  { "name": "Blueberry Muffin", "category": "Bakery & Pastry", "price": 120, "tax": 18, "unit": "PIECE", "description": "Moist muffin packed with fresh blueberries and a crunchy sugar top", "imageQuery": "blueberry muffin fresh baked" },
  { "name": "Chocolate Brownie", "category": "Bakery & Pastry", "price": 130, "tax": 18, "unit": "PIECE", "description": "Dense fudgy brownie with dark chocolate chunks and a crispy top", "imageQuery": "chocolate brownie fudgy dark" },
  { "name": "Almond Croissant", "category": "Bakery & Pastry", "price": 130, "tax": 18, "unit": "PIECE", "description": "Classic croissant filled with almond cream and topped with flaked almonds", "imageQuery": "almond croissant pastry" },
  { "name": "Cinnamon Roll", "category": "Bakery & Pastry", "price": 140, "tax": 18, "unit": "PIECE", "description": "Soft spiral roll with cinnamon sugar filling and cream cheese glaze", "imageQuery": "cinnamon roll iced glazed" },
  { "name": "Banana Bread", "category": "Bakery & Pastry", "price": 110, "tax": 18, "unit": "PIECE", "description": "Moist banana loaf with walnuts, perfect with a cup of coffee", "imageQuery": "banana bread walnut loaf" },
  { "name": "Red Velvet Cupcake", "category": "Bakery & Pastry", "price": 150, "tax": 18, "unit": "PIECE", "description": "Velvety red cake topped with swirled cream cheese frosting", "imageQuery": "red velvet cupcake cream cheese" },
  { "name": "Lemon Tart", "category": "Bakery & Pastry", "price": 160, "tax": 18, "unit": "PIECE", "description": "Crisp pastry shell filled with tangy lemon curd and candied zest", "imageQuery": "lemon tart pastry citrus" },
  { "name": "Chocolate Eclair", "category": "Bakery & Pastry", "price": 120, "tax": 18, "unit": "PIECE", "description": "Choux pastry filled with vanilla cream and coated in chocolate glaze", "imageQuery": "chocolate eclair pastry cream" },
  { "name": "Carrot Cake", "category": "Bakery & Pastry", "price": 170, "tax": 18, "unit": "PIECE", "description": "Spiced carrot cake with walnuts, raisins and thick cream cheese frosting", "imageQuery": "carrot cake slice cream frosting" },
  { "name": "Macaron Assortment", "category": "Bakery & Pastry", "price": 200, "tax": 18, "unit": "PIECE", "description": "Set of 4 French macarons in assorted flavors — raspberry, pistachio, vanilla, chocolate", "imageQuery": "french macarons colorful assorted" },
  { "name": "Cheesecake Slice", "category": "Bakery & Pastry", "price": 190, "tax": 18, "unit": "PIECE", "description": "New York-style baked cheesecake with graham cracker crust and berry compote", "imageQuery": "cheesecake slice berry topping" },
  { "name": "Chocolate Chip Cookie", "category": "Bakery & Pastry", "price": 60, "tax": 18, "unit": "PIECE", "description": "Warm, gooey cookie with generous dark chocolate chips", "imageQuery": "chocolate chip cookie warm" },
  { "name": "Strawberry Danish", "category": "Bakery & Pastry", "price": 140, "tax": 18, "unit": "PIECE", "description": "Flaky puff pastry with cream cheese and fresh strawberry topping", "imageQuery": "strawberry danish pastry cream" },
  { "name": "Multigrain Loaf (slice)", "category": "Bakery & Pastry", "price": 50, "tax": 18, "unit": "PIECE", "description": "Hearty slice of multigrain bread with seeds, great toasted", "imageQuery": "multigrain bread slice seeds" },
  { "name": "Pain au Chocolat", "category": "Bakery & Pastry", "price": 140, "tax": 18, "unit": "PIECE", "description": "Buttery puff pastry wrapped around dark chocolate sticks, served warm", "imageQuery": "pain au chocolat chocolate pastry" },
  { "name": "Pineapple Upside Down Cake", "category": "Bakery & Pastry", "price": 160, "tax": 18, "unit": "PIECE", "description": "Caramelized pineapple atop a moist vanilla sponge cake", "imageQuery": "pineapple upside down cake caramel" },
  { "name": "Walnut Brownie", "category": "Bakery & Pastry", "price": 140, "tax": 18, "unit": "PIECE", "description": "Rich chocolate brownie with crunchy walnuts throughout", "imageQuery": "walnut brownie chocolate dense" },
  { "name": "Matcha Cake Slice", "category": "Bakery & Pastry", "price": 180, "tax": 18, "unit": "PIECE", "description": "Light sponge cake infused with Japanese matcha and white chocolate cream", "imageQuery": "matcha cake green slice" },
  { "name": "Sourdough Toast", "category": "Bakery & Pastry", "price": 90, "tax": 18, "unit": "PIECE", "description": "Thick slice of house sourdough, toasted golden with butter", "imageQuery": "sourdough toast butter breakfast" },
  { "name": "Tiramisu", "category": "Bakery & Pastry", "price": 200, "tax": 18, "unit": "PIECE", "description": "Classic Italian tiramisu with espresso-soaked ladyfingers and mascarpone", "imageQuery": "tiramisu italian dessert coffee" },
  { "name": "Croissant Sandwich", "category": "Bakery & Pastry", "price": 180, "tax": 18, "unit": "PIECE", "description": "Flaky croissant stuffed with egg, cheese and fresh greens", "imageQuery": "croissant sandwich egg cheese" },
  { "name": "Blueberry Scone", "category": "Bakery & Pastry", "price": 130, "tax": 18, "unit": "PIECE", "description": "British-style scone with blueberries, served with clotted cream", "imageQuery": "blueberry scone cream british" },
  { "name": "Hazelnut Praline Tart", "category": "Bakery & Pastry", "price": 210, "tax": 18, "unit": "PIECE", "description": "Shortcrust pastry shell with hazelnut praline cream and dark chocolate shards", "imageQuery": "hazelnut tart chocolate pastry" },

  { "name": "Margherita Pizza", "category": "Main Course", "price": 280, "tax": 18, "unit": "PIECE", "description": "Classic wood-fired pizza with San Marzano tomato, fresh mozzarella and basil", "imageQuery": "margherita pizza fresh basil" },
  { "name": "Paneer Tikka Wrap", "category": "Main Course", "price": 180, "tax": 18, "unit": "PIECE", "description": "Smoky grilled paneer tikka wrapped in a whole wheat tortilla with mint chutney", "imageQuery": "paneer tikka wrap indian" },
  { "name": "Grilled Chicken Sandwich", "category": "Main Course", "price": 220, "tax": 18, "unit": "PIECE", "description": "Tender grilled chicken with lettuce, tomato and chipotle mayo on brioche", "imageQuery": "grilled chicken sandwich brioche" },
  { "name": "Pasta Arrabbiata", "category": "Main Course", "price": 240, "tax": 18, "unit": "PIECE", "description": "Penne tossed in spicy tomato garlic sauce with fresh parsley and parmesan", "imageQuery": "pasta arrabbiata spicy tomato" },
  { "name": "Canopy Club Sandwich", "category": "Main Course", "price": 250, "tax": 18, "unit": "PIECE", "description": "Triple-decker sandwich with chicken, bacon, egg, cheese and fresh veggies", "imageQuery": "club sandwich triple decker" },
  { "name": "Avocado Toast", "category": "Main Course", "price": 200, "tax": 18, "unit": "PIECE", "description": "Smashed avocado on sourdough with poached egg, chili flakes and microgreens", "imageQuery": "avocado toast poached egg" },
  { "name": "Mushroom Risotto", "category": "Main Course", "price": 280, "tax": 18, "unit": "PIECE", "description": "Creamy arborio rice cooked with wild mushrooms, white wine and parmesan", "imageQuery": "mushroom risotto creamy italian" },
  { "name": "Grilled Paneer Steak", "category": "Main Course", "price": 260, "tax": 18, "unit": "PIECE", "description": "Thick slab of paneer marinated in herbs and grilled, served with roasted vegetables", "imageQuery": "grilled paneer steak vegetables" },
  { "name": "Truffle Mushroom Pasta", "category": "Main Course", "price": 320, "tax": 18, "unit": "PIECE", "description": "Fettuccine tossed in truffle oil with sautéed mushrooms and cream sauce", "imageQuery": "truffle mushroom pasta fettuccine" },
  { "name": "Caprese Panini", "category": "Main Course", "price": 200, "tax": 18, "unit": "PIECE", "description": "Pressed panini with fresh mozzarella, tomato, basil and balsamic glaze", "imageQuery": "caprese panini pressed sandwich" },
  { "name": "Pesto Chicken Pasta", "category": "Main Course", "price": 290, "tax": 18, "unit": "PIECE", "description": "Grilled chicken over penne tossed in house-made basil pesto with pine nuts", "imageQuery": "pesto pasta chicken green" },
  { "name": "Veggie Burger", "category": "Main Course", "price": 220, "tax": 18, "unit": "PIECE", "description": "Crispy black bean and corn patty with guacamole and pickled jalapeños", "imageQuery": "veggie burger black bean patty" },
  { "name": "Egg Bhurji Sandwich", "category": "Main Course", "price": 150, "tax": 18, "unit": "PIECE", "description": "Spiced scrambled eggs with onion, tomato and green chili on multigrain bread", "imageQuery": "egg bhurji sandwich indian spiced" },
  { "name": "Cheese Quesadilla", "category": "Main Course", "price": 200, "tax": 18, "unit": "PIECE", "description": "Crispy tortilla filled with melted cheddar, peppers and corn, with salsa", "imageQuery": "cheese quesadilla crispy salsa" },
  { "name": "Buddha Bowl", "category": "Main Course", "price": 260, "tax": 18, "unit": "PIECE", "description": "Nourishing bowl with quinoa, roasted chickpeas, greens, tahini and pickled veggies", "imageQuery": "buddha bowl quinoa healthy" },
  { "name": "Shakshuka", "category": "Main Course", "price": 230, "tax": 18, "unit": "PIECE", "description": "Eggs poached in spiced tomato and pepper sauce, served with crusty bread", "imageQuery": "shakshuka eggs tomato sauce" },
  { "name": "Chicken Caesar Wrap", "category": "Main Course", "price": 210, "tax": 18, "unit": "PIECE", "description": "Romaine lettuce, grilled chicken, croutons and Caesar dressing in a flour tortilla", "imageQuery": "caesar wrap chicken tortilla" },
  { "name": "Mexican Bowl", "category": "Main Course", "price": 240, "tax": 18, "unit": "PIECE", "description": "Rice bowl with seasoned black beans, corn salsa, guacamole and sour cream", "imageQuery": "mexican burrito bowl rice beans" },
  { "name": "Palak Paneer Bowl", "category": "Main Course", "price": 220, "tax": 5, "unit": "PIECE", "description": "Creamy spinach curry with soft paneer cubes, served with tandoor roti", "imageQuery": "palak paneer spinach curry indian" },
  { "name": "Dal Makhani Platter", "category": "Main Course", "price": 200, "tax": 5, "unit": "PIECE", "description": "Slow-cooked black lentils in buttery tomato gravy with cream, served with rice and roti", "imageQuery": "dal makhani black lentil indian" },
  { "name": "Veg Fried Rice", "category": "Main Course", "price": 160, "tax": 5, "unit": "PIECE", "description": "Wok-tossed basmati rice with seasonal vegetables, soy sauce and sesame oil", "imageQuery": "vegetable fried rice wok" },
  { "name": "Pasta Carbonara", "category": "Main Course", "price": 280, "tax": 18, "unit": "PIECE", "description": "Spaghetti in classic egg and parmesan sauce with crispy pancetta", "imageQuery": "pasta carbonara spaghetti egg" },
  { "name": "Grilled Veggie Platter", "category": "Main Course", "price": 220, "tax": 18, "unit": "PIECE", "description": "Seasonal vegetables grilled to perfection with herb oil and lemon, with pita", "imageQuery": "grilled vegetables platter colorful" },
  { "name": "Chicken Tikka Pizza", "category": "Main Course", "price": 320, "tax": 18, "unit": "PIECE", "description": "Fusion pizza with tandoori chicken tikka, capsicum, onion on masala tomato base", "imageQuery": "chicken tikka pizza indian fusion" },
  { "name": "Korean Bun Burger", "category": "Main Course", "price": 290, "tax": 18, "unit": "PIECE", "description": "Steamed bao bun with Korean BBQ chicken, pickled daikon and sriracha mayo", "imageQuery": "korean bao bun burger asian" },

  { "name": "Samosa (2 pcs)", "category": "Snacks", "price": 60, "tax": 5, "unit": "PIECE", "description": "Crispy golden pastry filled with spiced potato and peas, with green chutney", "imageQuery": "samosa indian crispy golden" },
  { "name": "Masala Fries", "category": "Snacks", "price": 120, "tax": 5, "unit": "PIECE", "description": "Crispy fries tossed in chaat masala, chili powder and lime juice", "imageQuery": "masala fries spiced potato" },
  { "name": "Cheese Nachos", "category": "Snacks", "price": 180, "tax": 18, "unit": "PIECE", "description": "Tortilla chips loaded with melted cheddar, jalapeños, salsa and sour cream", "imageQuery": "nachos cheese jalapeno loaded" },
  { "name": "Onion Rings", "category": "Snacks", "price": 110, "tax": 5, "unit": "PIECE", "description": "Beer-battered onion rings, fried golden with smoky dipping sauce", "imageQuery": "onion rings crispy battered" },
  { "name": "Paneer Tikka (6 pcs)", "category": "Snacks", "price": 200, "tax": 5, "unit": "PIECE", "description": "Marinated paneer cubes grilled in tandoor with colorful bell peppers", "imageQuery": "paneer tikka grilled skewer" },
  { "name": "Garlic Bread", "category": "Snacks", "price": 100, "tax": 18, "unit": "PIECE", "description": "Toasted baguette slices with herbed garlic butter, served warm", "imageQuery": "garlic bread toasted herbs" },
  { "name": "Spring Rolls (4 pcs)", "category": "Snacks", "price": 140, "tax": 5, "unit": "PIECE", "description": "Crispy rolls stuffed with vegetables and glass noodles, with sweet chili sauce", "imageQuery": "spring rolls crispy vegetable" },
  { "name": "Vada Pav", "category": "Snacks", "price": 50, "tax": 5, "unit": "PIECE", "description": "Mumbai's iconic street food — spiced potato fritter in a soft pav with chutneys", "imageQuery": "vada pav mumbai street food" },
  { "name": "Cheese Garlic Toast", "category": "Snacks", "price": 120, "tax": 18, "unit": "PIECE", "description": "Thick toast with melted mozzarella, garlic and herbs, broiled to perfection", "imageQuery": "cheese garlic toast melted" },
  { "name": "Bruschetta", "category": "Snacks", "price": 150, "tax": 18, "unit": "PIECE", "description": "Grilled sourdough topped with fresh tomatoes, basil, olive oil and balsamic", "imageQuery": "bruschetta tomato basil italian" },
  { "name": "Chicken Nuggets", "category": "Snacks", "price": 180, "tax": 5, "unit": "PIECE", "description": "Crispy breaded chicken nuggets with honey mustard and ketchup", "imageQuery": "chicken nuggets crispy breaded" },
  { "name": "Pav Bhaji", "category": "Snacks", "price": 120, "tax": 5, "unit": "PIECE", "description": "Spiced mashed vegetable curry with buttered pav, onions and lemon", "imageQuery": "pav bhaji indian street food" },
  { "name": "Corn Chaat", "category": "Snacks", "price": 90, "tax": 5, "unit": "PIECE", "description": "Spiced sweet corn with butter, chili, lime and chaat masala", "imageQuery": "corn chaat spiced indian" },
  { "name": "Stuffed Mushrooms", "category": "Snacks", "price": 170, "tax": 18, "unit": "PIECE", "description": "Button mushrooms stuffed with cream cheese, herbs and breadcrumbs, baked golden", "imageQuery": "stuffed mushrooms cream cheese baked" },
  { "name": "Aloo Tikki (2 pcs)", "category": "Snacks", "price": 80, "tax": 5, "unit": "PIECE", "description": "Crispy potato patties with spiced stuffing, served with tamarind and mint chutney", "imageQuery": "aloo tikki potato patty indian" },
  { "name": "Mini Sliders (3 pcs)", "category": "Snacks", "price": 200, "tax": 18, "unit": "PIECE", "description": "Three mini beef/veg sliders on brioche buns with pickles and secret sauce", "imageQuery": "mini sliders brioche burger small" },
  { "name": "Dhokla", "category": "Snacks", "price": 80, "tax": 5, "unit": "PIECE", "description": "Soft steamed Gujarati snack with tempered mustard seeds, green chili and coriander", "imageQuery": "dhokla gujarati steamed snack" },
  { "name": "Popcorn (Masala)", "category": "Snacks", "price": 80, "tax": 5, "unit": "PIECE", "description": "Movie-style popcorn tossed in butter and house masala spice blend", "imageQuery": "masala popcorn spiced butter" },
  { "name": "French Fries", "category": "Snacks", "price": 100, "tax": 5, "unit": "PIECE", "description": "Classic thin-cut fries, perfectly golden and crispy, with ketchup", "imageQuery": "french fries golden crispy" },
  { "name": "Hara Bhara Kebab", "category": "Snacks", "price": 160, "tax": 5, "unit": "PIECE", "description": "Spinach, potato and peas patties pan-fried golden, with mint dip", "imageQuery": "hara bhara kebab green spinach" },
  { "name": "Cheese Pizza Puffs", "category": "Snacks", "price": 120, "tax": 18, "unit": "PIECE", "description": "Mini puff pastries filled with pizza sauce, mozzarella and oregano", "imageQuery": "cheese pizza puff pastry mini" },
  { "name": "Mezze Platter", "category": "Snacks", "price": 280, "tax": 18, "unit": "PIECE", "description": "Hummus, falafel, pita bread, olives, baba ghanoush and tzatziki", "imageQuery": "mezze platter hummus falafel middle eastern" },
  { "name": "Nachos with Guacamole", "category": "Snacks", "price": 200, "tax": 18, "unit": "PIECE", "description": "Crispy tortilla chips with fresh avocado guacamole and pico de gallo", "imageQuery": "nachos guacamole avocado chips" },
  { "name": "Chicken Wings (6 pcs)", "category": "Snacks", "price": 250, "tax": 5, "unit": "PIECE", "description": "Crispy wings in choice of buffalo, BBQ or honey garlic sauce", "imageQuery": "chicken wings buffalo sauce crispy" },
  { "name": "Bread Pakora", "category": "Snacks", "price": 70, "tax": 5, "unit": "PIECE", "description": "Bread stuffed with spiced potato, dipped in besan batter and deep fried", "imageQuery": "bread pakora indian fried snack" },

  { "name": "Gulab Jamun", "category": "Desserts", "price": 80, "tax": 5, "unit": "PIECE", "description": "Soft khoya dumplings soaked in rose-cardamom sugar syrup, served warm", "imageQuery": "gulab jamun indian sweet syrup" },
  { "name": "Chocolate Lava Cake", "category": "Desserts", "price": 180, "tax": 18, "unit": "PIECE", "description": "Warm chocolate cake with a molten center, served with vanilla ice cream", "imageQuery": "chocolate lava cake molten ice cream" },
  { "name": "Mango Panna Cotta", "category": "Desserts", "price": 170, "tax": 18, "unit": "PIECE", "description": "Silky Italian panna cotta with fresh Alphonso mango coulis and mint", "imageQuery": "mango panna cotta dessert italian" },
  { "name": "Rasmalai", "category": "Desserts", "price": 100, "tax": 5, "unit": "PIECE", "description": "Soft chenna dumplings in chilled saffron-cardamom rabdi, garnished with pistachios", "imageQuery": "rasmalai indian dessert saffron milk" },
  { "name": "Ice Cream Sundae", "category": "Desserts", "price": 160, "tax": 18, "unit": "PIECE", "description": "Three scoops of gelato with hot fudge, whipped cream, nuts and cherry", "imageQuery": "ice cream sundae hot fudge" },
  { "name": "Crème Brûlée", "category": "Desserts", "price": 200, "tax": 18, "unit": "PIECE", "description": "Silky vanilla custard with a perfectly caramelized sugar crust", "imageQuery": "creme brulee caramel custard french" },
  { "name": "Kulfi (Stick)", "category": "Desserts", "price": 80, "tax": 5, "unit": "PIECE", "description": "Traditional Indian ice cream with pistachio and cardamom, on a stick", "imageQuery": "kulfi indian ice cream stick pistachio" },
  { "name": "Waffles with Maple Syrup", "category": "Desserts", "price": 190, "tax": 18, "unit": "PIECE", "description": "Belgian waffles with fresh berries, whipped cream and warm maple syrup", "imageQuery": "waffles maple syrup berries belgian" },
  { "name": "Kheer", "category": "Desserts", "price": 90, "tax": 5, "unit": "PIECE", "description": "Rice pudding cooked slowly in milk with saffron, rose water and dry fruits", "imageQuery": "kheer rice pudding indian dessert" },
  { "name": "Chocolate Mousse", "category": "Desserts", "price": 170, "tax": 18, "unit": "PIECE", "description": "Airy dark chocolate mousse with chantilly cream and chocolate shavings", "imageQuery": "chocolate mousse dark airy dessert" },
  { "name": "Gajar Ka Halwa", "category": "Desserts", "price": 100, "tax": 5, "unit": "PIECE", "description": "Warm carrot pudding with ghee, milk and nuts — a winter classic", "imageQuery": "gajar halwa carrot pudding indian" },
  { "name": "Fruit Trifle", "category": "Desserts", "price": 150, "tax": 18, "unit": "PIECE", "description": "Layered dessert with sponge, custard, jelly and fresh seasonal fruits", "imageQuery": "fruit trifle layered dessert custard" },
  { "name": "Affogato", "category": "Desserts", "price": 160, "tax": 18, "unit": "PIECE", "description": "A scoop of vanilla gelato drowned in a double shot of hot espresso", "imageQuery": "affogato espresso gelato italian" },
  { "name": "Shahi Tukda", "category": "Desserts", "price": 120, "tax": 5, "unit": "PIECE", "description": "Fried bread soaked in saffron rabdi with silver leaf and rose petals", "imageQuery": "shahi tukda indian bread dessert" },
  { "name": "Strawberry Shortcake", "category": "Desserts", "price": 180, "tax": 18, "unit": "PIECE", "description": "Layers of vanilla sponge with fresh strawberries and Chantilly cream", "imageQuery": "strawberry shortcake cream sponge" },
  { "name": "Pista Kulfi", "category": "Desserts", "price": 90, "tax": 5, "unit": "PIECE", "description": "Rich pistachio kulfi with chopped dry fruits and rose water", "imageQuery": "pista kulfi pistachio dessert" },
  { "name": "Mango Sorbet", "category": "Desserts", "price": 120, "tax": 18, "unit": "PIECE", "description": "Dairy-free refreshing sorbet made with 100% Alphonso mango pulp", "imageQuery": "mango sorbet frozen dessert orange" },
  { "name": "Pancake Stack", "category": "Desserts", "price": 170, "tax": 18, "unit": "PIECE", "description": "Fluffy buttermilk pancakes stacked high with butter and drizzled maple syrup", "imageQuery": "pancake stack fluffy maple syrup" },
  { "name": "Bread Pudding", "category": "Desserts", "price": 140, "tax": 18, "unit": "PIECE", "description": "Classic bread pudding with vanilla custard sauce and caramel drizzle", "imageQuery": "bread pudding vanilla custard caramel" },
  { "name": "Mango Cheesecake", "category": "Desserts", "price": 210, "tax": 18, "unit": "PIECE", "description": "No-bake cheesecake with fresh mango glaze and digestive biscuit base", "imageQuery": "mango cheesecake no bake yellow" },
  { "name": "Phirni", "category": "Desserts", "price": 90, "tax": 5, "unit": "PIECE", "description": "Chilled ground rice pudding with saffron and cardamom, set in clay pots", "imageQuery": "phirni indian rice pudding clay pot" },
  { "name": "Churros with Chocolate", "category": "Desserts", "price": 160, "tax": 18, "unit": "PIECE", "description": "Spanish fried dough sticks dusted with cinnamon sugar, with dark chocolate dip", "imageQuery": "churros chocolate dip cinnamon sugar" },
  { "name": "Motichoor Ladoo", "category": "Desserts", "price": 60, "tax": 5, "unit": "PIECE", "description": "Soft spherical Indian sweet made from fine chickpea flour pearls and ghee", "imageQuery": "motichoor ladoo indian sweet orange" },
  { "name": "Nutella Crepe", "category": "Desserts", "price": 170, "tax": 18, "unit": "PIECE", "description": "Thin French crepe filled with Nutella, sliced banana and crushed hazelnuts", "imageQuery": "nutella crepe banana thin french" },

  { "name": "Masala Dosa", "category": "South Indian", "price": 120, "tax": 5, "unit": "PIECE", "description": "Crispy rice and lentil crepe with spiced potato filling, sambar and coconut chutney", "imageQuery": "masala dosa crispy south indian" },
  { "name": "Idli (3 pcs)", "category": "South Indian", "price": 80, "tax": 5, "unit": "PIECE", "description": "Steamed rice cakes served with sambar and three varieties of chutney", "imageQuery": "idli sambar south indian steamed" },
  { "name": "Medu Vada (2 pcs)", "category": "South Indian", "price": 90, "tax": 5, "unit": "PIECE", "description": "Crispy urad dal doughnuts with coconut chutney and sambar", "imageQuery": "medu vada crispy doughnut south indian" },
  { "name": "Uttapam", "category": "South Indian", "price": 110, "tax": 5, "unit": "PIECE", "description": "Thick rice pancake topped with onion, tomato, green chili and coriander", "imageQuery": "uttapam south indian pancake toppings" },
  { "name": "Rava Dosa", "category": "South Indian", "price": 130, "tax": 5, "unit": "PIECE", "description": "Thin lacey semolina crepe with cashews, served with coconut chutney", "imageQuery": "rava dosa semolina crispy lacey" },
  { "name": "Pongal", "category": "South Indian", "price": 100, "tax": 5, "unit": "PIECE", "description": "Creamy rice and moong dal dish tempered with pepper, cumin and ghee", "imageQuery": "pongal south indian rice lentil" },
  { "name": "Appam with Stew", "category": "South Indian", "price": 150, "tax": 5, "unit": "PIECE", "description": "Soft rice hoppers with Kerala-style vegetable coconut milk stew", "imageQuery": "appam stew kerala coconut" },
  { "name": "Mini Idli Sambar (12 pcs)", "category": "South Indian", "price": 130, "tax": 5, "unit": "PIECE", "description": "Bite-sized idlis dunked in flavorful sambar with mini ghee drizzle", "imageQuery": "mini idli sambar small south indian" },
  { "name": "Set Dosa (3 pcs)", "category": "South Indian", "price": 110, "tax": 5, "unit": "PIECE", "description": "Soft, spongy small dosas served in a set with sambar and three chutneys", "imageQuery": "set dosa soft south indian small" },
  { "name": "Chettinad Chicken Bowl", "category": "South Indian", "price": 220, "tax": 5, "unit": "PIECE", "description": "Fragrant Chettinad-spiced chicken curry with steamed rice and papad", "imageQuery": "chettinad chicken curry south indian" },
  { "name": "Pesarattu", "category": "South Indian", "price": 100, "tax": 5, "unit": "PIECE", "description": "Green moong dal dosa topped with ginger chutney and sesame seeds", "imageQuery": "pesarattu green moong dosa" },
  { "name": "Bisibelebath", "category": "South Indian", "price": 140, "tax": 5, "unit": "PIECE", "description": "Karnataka one-pot dish of rice, lentils and vegetables in tamarind-spice base", "imageQuery": "bisibelebath karnataka rice lentil one pot" },
  { "name": "Tomato Rice", "category": "South Indian", "price": 120, "tax": 5, "unit": "PIECE", "description": "Tangy rice cooked with tomatoes, curry leaves and mustard tempering", "imageQuery": "tomato rice south indian tangy" },
  { "name": "Rasam", "category": "South Indian", "price": 60, "tax": 5, "unit": "PIECE", "description": "Light, peppery tamarind and tomato soup — a comforting South Indian classic", "imageQuery": "rasam south indian soup pepper" },
  { "name": "Coconut Chutney (side)", "category": "South Indian", "price": 30, "tax": 5, "unit": "PIECE", "description": "Freshly ground coconut chutney with green chili, ginger and curry leaf tempering", "imageQuery": "coconut chutney white side dish" },

  { "name": "Butter Chicken", "category": "North Indian", "price": 240, "tax": 5, "unit": "PIECE", "description": "Tender chicken in rich, creamy tomato gravy with aromatic spices and fenugreek", "imageQuery": "butter chicken curry creamy indian" },
  { "name": "Paneer Butter Masala", "category": "North Indian", "price": 220, "tax": 5, "unit": "PIECE", "description": "Soft paneer cubes in a velvety cashew-tomato gravy, served with naan", "imageQuery": "paneer butter masala curry orange" },
  { "name": "Tandoori Roti", "category": "North Indian", "price": 40, "tax": 5, "unit": "PIECE", "description": "Whole wheat flatbread baked in a clay tandoor, brushed with butter", "imageQuery": "tandoori roti bread tandoor" },
  { "name": "Butter Naan", "category": "North Indian", "price": 50, "tax": 5, "unit": "PIECE", "description": "Leavened flour bread baked in tandoor, generously brushed with butter", "imageQuery": "butter naan bread tandoor soft" },
  { "name": "Dal Tadka", "category": "North Indian", "price": 160, "tax": 5, "unit": "PIECE", "description": "Yellow lentils tempered with cumin, garlic, dried red chilies and ghee", "imageQuery": "dal tadka yellow lentil indian" },
  { "name": "Chole Bhature", "category": "North Indian", "price": 160, "tax": 5, "unit": "PIECE", "description": "Spiced chickpea curry with fluffy deep-fried bread, pickled onions and mango pickle", "imageQuery": "chole bhature chickpea north indian" },
  { "name": "Rajma Chawal", "category": "North Indian", "price": 160, "tax": 5, "unit": "PIECE", "description": "Red kidney bean curry in smoky tomato-onion gravy served over steamed basmati", "imageQuery": "rajma chawal kidney beans rice" },
  { "name": "Paneer Tikka Masala", "category": "North Indian", "price": 230, "tax": 5, "unit": "PIECE", "description": "Grilled paneer tikka simmered in spiced masala gravy with cream", "imageQuery": "paneer tikka masala curry creamy" },
  { "name": "Lasagna (Desi)", "category": "North Indian", "price": 260, "tax": 18, "unit": "PIECE", "description": "Layered pasta with spiced keema, béchamel and parmesan — an Indian twist on an Italian classic", "imageQuery": "lasagna layered pasta baked" },
  { "name": "Aloo Paratha", "category": "North Indian", "price": 100, "tax": 5, "unit": "PIECE", "description": "Whole wheat flatbread stuffed with spiced mashed potato, served with butter and pickle", "imageQuery": "aloo paratha stuffed flatbread butter" },
  { "name": "Matar Paneer", "category": "North Indian", "price": 200, "tax": 5, "unit": "PIECE", "description": "Paneer and green peas in an onion-tomato masala, flavored with garam masala", "imageQuery": "matar paneer peas curry indian" },
  { "name": "Kadai Paneer", "category": "North Indian", "price": 220, "tax": 5, "unit": "PIECE", "description": "Paneer with capsicum and tomatoes in a bold kadai spice base", "imageQuery": "kadai paneer capsicum tomato" },
  { "name": "Chicken Biryani", "category": "North Indian", "price": 280, "tax": 5, "unit": "PIECE", "description": "Slow-cooked Dum Biryani with aromatic basmati, spices, saffron and raita", "imageQuery": "chicken biryani dum basmati rice" },
  { "name": "Garlic Naan", "category": "North Indian", "price": 60, "tax": 5, "unit": "PIECE", "description": "Soft naan topped with roasted garlic, butter and coriander", "imageQuery": "garlic naan bread indian" },
  { "name": "Shahi Paneer", "category": "North Indian", "price": 240, "tax": 5, "unit": "PIECE", "description": "Royal paneer dish in a rich cashew, cream and saffron gravy", "imageQuery": "shahi paneer royal curry cream" },

  { "name": "Classic Cheese Burger", "category": "Fast Food", "price": 220, "tax": 18, "unit": "PIECE", "description": "100g beef/veg patty with cheddar, iceberg lettuce, tomato and special sauce", "imageQuery": "classic cheeseburger beef patty" },
  { "name": "Double Patty Burger", "category": "Fast Food", "price": 280, "tax": 18, "unit": "PIECE", "description": "Double stacked patties with double cheese, caramelized onions and sriracha", "imageQuery": "double burger patty stacked" },
  { "name": "Chicken Crispy Burger", "category": "Fast Food", "price": 200, "tax": 18, "unit": "PIECE", "description": "Crispy fried chicken fillet with coleslaw and chipotle mayo on brioche bun", "imageQuery": "crispy chicken burger sandwich fried" },
  { "name": "Spicy Zinger Burger", "category": "Fast Food", "price": 210, "tax": 18, "unit": "PIECE", "description": "Extra-spicy fried chicken with ghost pepper sauce, pickles and butter bun", "imageQuery": "spicy zinger burger chicken" },
  { "name": "Hot Dog", "category": "Fast Food", "price": 150, "tax": 18, "unit": "PIECE", "description": "Grilled sausage in a soft bun with mustard, ketchup and caramelized onions", "imageQuery": "hot dog sausage grilled bun" },
  { "name": "Pepperoni Pizza Slice", "category": "Fast Food", "price": 160, "tax": 18, "unit": "PIECE", "description": "Generously topped pepperoni pizza slice with mozzarella and oregano", "imageQuery": "pepperoni pizza slice mozzarella" },
  { "name": "Loaded Potato Skins", "category": "Fast Food", "price": 180, "tax": 18, "unit": "PIECE", "description": "Crispy potato skins loaded with cheese, jalapeños, bacon bits and sour cream", "imageQuery": "potato skins loaded cheese bacon" },
  { "name": "Shawarma Roll", "category": "Fast Food", "price": 170, "tax": 5, "unit": "PIECE", "description": "Marinated grilled chicken shawarma wrapped in pita with garlic sauce and pickles", "imageQuery": "shawarma roll chicken pita middle eastern" },
  { "name": "Kathi Roll", "category": "Fast Food", "price": 140, "tax": 5, "unit": "PIECE", "description": "Flaky paratha roll with paneer/egg/chicken tikka, onion, chutney and sauce", "imageQuery": "kathi roll paratha indian street" },
  { "name": "Mac and Cheese", "category": "Fast Food", "price": 190, "tax": 18, "unit": "PIECE", "description": "Creamy baked macaroni with a four-cheese sauce and crispy breadcrumb top", "imageQuery": "mac and cheese creamy baked" },
  { "name": "Loaded Burger Fries", "category": "Fast Food", "price": 200, "tax": 18, "unit": "PIECE", "description": "Crispy fries smothered with burger patty crumbles, cheese sauce and pickles", "imageQuery": "loaded fries cheese burger crumbles" },
  { "name": "Grilled Veggie Sub", "category": "Fast Food", "price": 160, "tax": 18, "unit": "PIECE", "description": "Six-inch sub with grilled zucchini, peppers, mushrooms, hummus and greens", "imageQuery": "veggie sub sandwich grilled" },
  { "name": "Chicken Frankie", "category": "Fast Food", "price": 130, "tax": 5, "unit": "PIECE", "description": "Mumbai street-style egg roll with spiced chicken, onions and chutney", "imageQuery": "chicken frankie roll mumbai street" },
  { "name": "Peri Peri Chicken Wrap", "category": "Fast Food", "price": 190, "tax": 5, "unit": "PIECE", "description": "Grilled peri peri chicken, lettuce, corn and garlic sauce in a flour tortilla", "imageQuery": "peri peri chicken wrap tortilla" },
  { "name": "BBQ Chicken Pizza", "category": "Fast Food", "price": 300, "tax": 18, "unit": "PIECE", "description": "BBQ sauce base with shredded chicken, red onion, jalapeños and mozzarella", "imageQuery": "bbq chicken pizza mozzarella" },
  { "name": "Cheese Steak Sub", "category": "Fast Food", "price": 240, "tax": 18, "unit": "PIECE", "description": "Philly-style sub with shaved steak, caramelized onions and provolone", "imageQuery": "philly cheese steak sub sandwich" },

  { "name": "Granola & Yogurt Bowl", "category": "Healthy Options", "price": 160, "tax": 5, "unit": "PIECE", "description": "House granola with Greek yogurt, fresh berries and local honey drizzle", "imageQuery": "granola yogurt bowl berries healthy" },
  { "name": "Acai Bowl", "category": "Healthy Options", "price": 210, "tax": 5, "unit": "PIECE", "description": "Thick acai smoothie base topped with granola, banana, chia seeds and coconut flakes", "imageQuery": "acai bowl smoothie bowl healthy" },
  { "name": "Green Detox Smoothie", "category": "Healthy Options", "price": 160, "tax": 5, "unit": "PIECE", "description": "Spinach, cucumber, apple, ginger and lemon — a cleansing green blend", "imageQuery": "green detox smoothie spinach healthy" },
  { "name": "Chia Seed Pudding", "category": "Healthy Options", "price": 140, "tax": 5, "unit": "PIECE", "description": "Overnight chia pudding in coconut milk topped with mango and kiwi", "imageQuery": "chia pudding coconut milk fruit" },
  { "name": "Quinoa Salad", "category": "Healthy Options", "price": 200, "tax": 5, "unit": "PIECE", "description": "Tri-color quinoa with roasted sweet potato, chickpeas, feta and lemon tahini dressing", "imageQuery": "quinoa salad healthy colorful bowl" },
  { "name": "Egg White Omelette", "category": "Healthy Options", "price": 160, "tax": 5, "unit": "PIECE", "description": "Three egg white omelette with spinach, mushrooms, cherry tomatoes and herbs", "imageQuery": "egg white omelette healthy spinach" },
  { "name": "Overnight Oats", "category": "Healthy Options", "price": 140, "tax": 5, "unit": "PIECE", "description": "Rolled oats soaked in almond milk with chia seeds, topped with seasonal fruit", "imageQuery": "overnight oats almond milk fruit" },
  { "name": "Protein Smoothie Bowl", "category": "Healthy Options", "price": 200, "tax": 5, "unit": "PIECE", "description": "Whey protein blended with banana and almond milk, topped with seeds and granola", "imageQuery": "protein smoothie bowl seeds granola" },
  { "name": "Kale Caesar Salad", "category": "Healthy Options", "price": 190, "tax": 5, "unit": "PIECE", "description": "Massaged kale with Caesar dressing, hemp seeds, croutons and nutritional yeast", "imageQuery": "kale caesar salad healthy green" },
  { "name": "Multigrain Avocado Bowl", "category": "Healthy Options", "price": 220, "tax": 5, "unit": "PIECE", "description": "Multigrain bowl with avocado, poached egg, edamame, sprouts and sesame dressing", "imageQuery": "avocado grain bowl healthy poached egg" },
  { "name": "Fruit Salad Bowl", "category": "Healthy Options", "price": 120, "tax": 5, "unit": "PIECE", "description": "Seasonal fresh fruits with chaat masala and a squeeze of lime", "imageQuery": "fruit salad bowl fresh colorful" },
  { "name": "Sprouts Chaat", "category": "Healthy Options", "price": 100, "tax": 5, "unit": "PIECE", "description": "Mixed sprouts with onion, tomato, chaat masala and pomegranate seeds", "imageQuery": "sprouts chaat healthy indian" },
  { "name": "Baked Oatmeal", "category": "Healthy Options", "price": 150, "tax": 5, "unit": "PIECE", "description": "Oven-baked oats with cinnamon, raisins and honey — served warm", "imageQuery": "baked oatmeal cinnamon raisins warm" },
  { "name": "Poke Bowl", "category": "Healthy Options", "price": 280, "tax": 5, "unit": "PIECE", "description": "Hawaiian-style bowl with sushi rice, marinated tofu/salmon, edamame and sriracha mayo", "imageQuery": "poke bowl sushi rice healthy" },
  { "name": "Veggie Wrap (Low Carb)", "category": "Healthy Options", "price": 160, "tax": 5, "unit": "PIECE", "description": "Lettuce wrap with hummus, roasted veggies, feta and olives — low-carb and fresh", "imageQuery": "lettuce wrap low carb healthy vegetable" }
];

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // 1. Clear existing categories and products data
    await pool.query('TRUNCATE categories, products CASCADE');


    // 4. Create Categories
    const categoriesToInsert = [
      { name: 'Beverages', color: '#8B5A2B', sort_order: 1 },
      { name: 'Bakery & Pastry', color: '#D2B48C', sort_order: 2 },
      { name: 'Main Course', color: '#C8A97A', sort_order: 3 },
      { name: 'Snacks', color: '#FF8C00', sort_order: 4 },
      { name: 'Desserts', color: '#C97BA3', sort_order: 5 },
      { name: 'South Indian', color: '#8BAF6B', sort_order: 6 },
      { name: 'North Indian', color: '#E8B86D', sort_order: 7 },
      { name: 'Fast Food', color: '#FF4500', sort_order: 8 },
      { name: 'Healthy Options', color: '#4CAF50', sort_order: 9 }
    ];

    const categoryIds: { [key: string]: string } = {};
    for (const cat of categoriesToInsert) {
      const res = await pool.query(
        `INSERT INTO categories (name, color, sort_order) VALUES ($1, $2, $3) RETURNING id`,
        [cat.name, cat.color, cat.sort_order]
      );
      categoryIds[cat.name] = res.rows[0].id;
    }

    console.log('✅ Seeded categories.');

    // 5. Create Products
    for (const item of items) {
      const categoryId = categoryIds[item.category];
      const imageUrl = categoryImages[item.category] || null;
      
      await pool.query(
        `INSERT INTO products (name, category_id, price, tax, description, unit_of_measure, image_url, kitchen_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          item.name,
          categoryId,
          item.price,
          item.tax,
          item.description,
          item.unit.toLowerCase(),
          imageUrl,
          true // kitchen enabled by default
        ]
      );
    }

    console.log(`✅ Seeded ${items.length} products.`);
    console.log('🌱 Seeding process complete!');
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await pool.end();
  }
}

seed();
