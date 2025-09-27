import React, { useState } from "react";
import Navbar from "./Navbar";

// ---------------- Trending Recipes ----------------
const trendingRecipes = [
  // ---------------- Desserts ----------------
{
    id: 1,
    title: "Viral Chocolate Lava Cake",
    video: "https://www.youtube.com/embed/56k0A-166tw",
    thumbnail: "https://media.istockphoto.com/id/1414762850/photo/delicious-fresh-fondant-with-hot-chocolate-and-ice-cream-on-white-table-flat-lay.jpg?s=612x612&w=0&k=20&c=ynX8mqSiUwdD2pa1-pPROqwWyVLlqCV8i-nwRLQG16E=",
    cookTime: "25 min",
    servings: 4,
    rating: 4.9,
    difficulty: "Medium",
    category: "Dessert",
    description: "TikTok famous molten chocolate cake with a gooey center."
  },
  {
    id: 2,
    title: "Chocolate Peanut Butter Mug Cake",
    video: "https://www.youtube.com/embed/PWDTq7HrdJ0",
    thumbnail: "https://media.istockphoto.com/id/1153487811/photo/fresh-homemade-cake-in-mug-with-peanut-butter-and-chocolate-chips-on-rustic-wooden-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=-HCM3ewLYjKMBuEdC5qg4YjndbBBrbrGETVmPzm0Emg=",
    cookTime: "5 min",
    servings: 1,
    rating: 4.8,
    difficulty: "Easy",
    category: "Dessert",
    description: "Single-serve mug cake trending online for its ease and taste."
},

  {
    id: 3,
    title: "Microwave Mug Brownie",
    video: "https://www.youtube.com/embed/7u3ZChGCFUE",
    thumbnail: "https://media.istockphoto.com/id/1137415489/photo/brownie-cake-in-a-mug-chocolate-mug-cake.webp?a=1&b=1&s=612x612&w=0&k=20&c=8L4UOWP_PmMH8yDYCw1DTKWuzs3NMBZWWZpnMFdFI3w=",
    cookTime: "5 min",
    servings: 1,
    rating: 4.8,
    difficulty: "Easy",
    category: "Dessert",
    description: "Single-serve chocolate brownie made in a mug, ready in 5 minutes."
},

  {
    id: 4,
    title: "Chocolate Dalgona Ice Cream",
    video: "https://www.youtube.com/embed/srfdlJxGrz8",
    thumbnail: "https://plus.unsplash.com/premium_photo-1708769593100-c5e0af78f3d1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aG9jb2xhdGUlMjBEYWxnb25hJTIwSWNlJTIwQ3JlYW18ZW58MHx8MHx8fDA%3D",
    cookTime: "15 min",
    servings: 2,
    rating: 4.8,
    difficulty: "Easy",
    category: "Dessert",
    description: "Viral TikTok dessert with whipped chocolate and cream."
},

 {
    id: 5,
    title: "Gulab Jamun Cheesecake",
    video: "https://www.youtube.com/embed/nm53d18Z6no",
    thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3Xl8ANFQTeohh9cG0t_PhCFA6Z9_nUmAdvw&s",
    cookTime: "40 min",
    servings: 4,
    rating: 4.9,
    difficulty: "Hard",
    category: "Dessert",
    description: "Fusion of classic Indian gulab jamun with cheesecake."
},

  {
    id: 6,
    title: "Mango Cheesecake",
    video: "https://www.youtube.com/embed/VGfhqb_UP3Q",
    thumbnail: "https://media.istockphoto.com/id/1340246988/photo/mango-cheesecake-on-white-plate.webp?a=1&b=1&s=612x612&w=0&k=20&c=v4KXDdWid1Pd0bZhZeOEZKdpeznDYJL9HQxi8rqOjZw=",
    cookTime: "35 min",
    servings: 4,
    rating: 4.9,
    difficulty: "Medium",
    category: "Dessert",
    description: "No-bake mango cheesecake trending on YouTube."
},
{
    id: 7,
    title: "Banana Pancakes (2 Ingredients)",
    video: "https://www.youtube.com/embed/uHP1C794L1k",
    thumbnail: "https://plus.unsplash.com/premium_photo-1692193552327-3458ef3817c0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8QmFuYW5hJTIwUGFuY2FrZXN8ZW58MHx8MHx8fDA%3D",
    cookTime: "10 min",
    servings: 2,
    rating: 4.9,
    difficulty: "Easy",
    category: "Quick & Easy",
    description: "Two-ingredient pancakes made with banana and eggs, trending online."
},

  {
    id: 8,
    title: "Peanut Butter Banana Toast",
    video: "https://www.youtube.com/embed/erz50vs2pZU",
    thumbnail: "https://plus.unsplash.com/premium_photo-1692809723055-0a5e8272268c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8UGVhbnV0JTIwQnV0dGVyJTIwQmFuYW5hJTIwVG9hc3R8ZW58MHx8MHx8fDA%3D",
    cookTime: "5 min",
    servings: 1,
    rating: 4.8,
    difficulty: "Easy",
    category: "Quick & Easy",
    description: "Quick viral breakfast toast with peanut butter and banana."
},
{
    id: 9,
    title: "Choco Chip Pancakes",
    video: "https://www.youtube.com/embed/zrs1p_j2K-M",
    thumbnail: "https://media.istockphoto.com/id/1355696061/photo/stack-of-oats-choco-chips-pancakes-along-with-coffee-for-breakfast-healthy-pancakes-made-of.webp?a=1&b=1&s=612x612&w=0&k=20&c=23xkCJCtY9dAeYkP8PQDN1GqWcZh6k9PEvo7t2oL2SI=",
    cookTime: "15 min",
    servings: 2,
    rating: 4.8,
    difficulty: "Easy",
    category: "Quick & Easy",
    description: "Fluffy pancakes with chocolate chips trending on TikTok."
},
{
    id: 10,
    title: "Chocolate Strawberry Croissant",
    video: "https://www.youtube.com/embed/Ldgm3YD-tMQ",
    thumbnail: "https://images.unsplash.com/photo-1721324412655-63d4885d9e67?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Q2hvY29sYXRlJTIwU3RyYXdiZXJyeSUyMENyb2lzc2FudHxlbnwwfHwwfHx8MA%3D%3D",
    cookTime: "30 min",
    servings: 2,
    rating: 4.9,
    difficulty: "Medium",
    category: "Dessert",
    description: "Viral bakery-style croissant filled with chocolate and strawberries."
},
{
    id: 11,
    title: "Mango Matcha Iced Latte",
    video: "https://www.youtube.com/embed/OZk8507yX5Q",
    thumbnail: "https://media.istockphoto.com/id/2216659305/photo/iced-mango-matcha-latte-in-glass-on-the-table.webp?a=1&b=1&s=612x612&w=0&k=20&c=KnxqbgqiNg7tX6zpEOPWLu_TbtiJbxzPjraJcOKAowU=",
    cookTime: "12 min",
    servings: 1,
    rating: 4.8,
    difficulty: "Easy",
    category: "Beverages",
    description: "Refreshing iced latte combining mango puree and matcha, trending online."
},
{
    id: 12,
    title: "Instant Ramen Upgrade",
    video: "https://www.youtube.com/embed/ep7YtrgYZ1Y",
    thumbnail: "https://media.istockphoto.com/id/1144177675/photo/ramen-noodles-in-soy-sauce-flavored-soup.webp?a=1&b=1&s=612x612&w=0&k=20&c=AExrgy2pXY6-aClDEN313y3u9AofeD-KADtUlSrforg=",
    cookTime: "10 min",
    servings: 1,
    rating: 4.7,
    difficulty: "Easy",
    category: "Quick & Easy",
    description: "Transform instant noodles into a viral gourmet meal."
},
{
    id: 13,
    title: "Veggie Wrap",
    video: "https://www.youtube.com/embed/O8qUjwzi0zA",
    thumbnail: "https://media.istockphoto.com/id/637026220/photo/vegan-wrap.webp?a=1&b=1&s=612x612&w=0&k=20&c=_qT7Lt4UbRb8BRdIrDAKMr0mgra-ttQy0w7VgaH7-cM=",
    cookTime: "10 min",
    servings: 2,
    rating: 4.7,
    difficulty: "Easy",
    category: "Quick & Easy",
    description: "Healthy tortilla wrap filled with fresh vegetables and trending sauces."
},
{
    id: 14,
    title: "Garlic Butter Shrimp",
    video: "https://www.youtube.com/embed/vXjgZ6VGveE",
    thumbnail: "https://media.istockphoto.com/id/1414307299/photo/closeup-garlic-butter-shrimp-in-pan.webp?a=1&b=1&s=612x612&w=0&k=20&c=RcXKgoUJc1exWAGC-mPBCQY6IXVY1qxARs_8sP_zOGE=",
    cookTime: "15 min",
    servings: 2,
    rating: 4.8,
    difficulty: "Easy",
    category: "Quick & Easy",
    description: "Succulent shrimp cooked in garlic butter, trending on TikTok."
},
{
    id: 15,
    title: "Kunafa Cheesecake",
    video: "https://www.youtube.com/embed/Tp3xa4UcnQA",
    thumbnail: "https://media.istockphoto.com/id/1803757616/photo/a-piece-of-homemade-baklava-cheesecake-with-pistacchio-light-cream-cheese-filling-on-top-of.jpg?s=612x612&w=0&k=20&c=V9lFCIsHFg9sWn8QRn6_KXv5nMc_cL7sB281TbJeIp8=",
    cookTime: "45 min",
    servings: 4,
    rating: 4.9,
    difficulty: "Hard",
    category: "Dessert",
    description: "Fusion of Middle Eastern kunafa with cheesecake, viral on Instagram."
},

  {
    id: 16,
    title: "Milk Break Dessert",
    video: "https://www.youtube.com/embed/7rIsdIE63oQ",
    thumbnail: "https://www.countryhillcottage.com/wp-content/uploads/2022/04/Condensed_Milk_Bread_Pudding-01.jpg",
    cookTime: "20 min",
    servings: 2,
    rating: 4.9,
    difficulty: "Easy",
    category: "Dessert",
    description: "Viral creamy dessert inspired by Kinder Milk Slice."
},
{
    id: 17,
    title: "Garlic Maggi",
    video: "https://www.youtube.com/embed/sKuXgsgedrk",
    thumbnail: "https://media.istockphoto.com/id/483137365/photo/asian-chow-mein-noodles.jpg?s=612x612&w=0&k=20&c=aVkPKpDkiAM7CxTFinQBax0i-nm-ybzWimrJRyPePcg=",
    cookTime: "10 min",
    servings: 1,
    rating: 4.8,
    difficulty: "Easy",
    category: "Quick Snack",
    description: "Street-style spicy garlic Maggi noodles trending on Instagram."
},
{
    id: 18,
    title: "Cheesy Garlic Bread",
    video: "https://www.youtube.com/embed/jMq7l6MHBMY",
    thumbnail: "https://media.istockphoto.com/id/1322744227/photo/homemade-cheesy-pull-apart-garlic-bread.jpg?s=612x612&w=0&k=20&c=15gz3daHCEXAzrRN91AAMbc89D73GB0k8YGjPxv0gyQ=",
    cookTime: "15 min",
    servings: 2,
    rating: 4.7,
    difficulty: "Easy",
    category: "Snacks",
    description: "Viral cheesy garlic bread with bubbling mozzarella."
},
{
    id: 19,
    title: "Tandoori Chicken Wings",
    video: "https://www.youtube.com/embed/PbBs_dvTAwk",
    thumbnail: "https://media.istockphoto.com/id/995903748/photo/smoked-and-spicy-tandoori-chicken-grilling-with-smoke.webp?a=1&b=1&s=612x612&w=0&k=20&c=X1bJni9WOxyZHIX73J8PIJ9XfJ_0idFDK7-GAk3FqDc=",
    cookTime: "40 min",
    servings: 4,
    rating: 4.8,
    difficulty: "Medium",
    category: "Snacks",
    description: "Spicy and smoky tandoori wings trending on Instagram."
},
{
    id: 20,
    title: "Chicken Shawarma Wrap",
    video: "https://www.youtube.com/embed/UOz9FZ3JaEk",
    thumbnail: "https://media.istockphoto.com/id/171579564/photo/chicken-souvlaki-wrap.webp?a=1&b=1&s=612x612&w=0&k=20&c=PClOgCTeIi8F77XbDK3B5iWVcJo5Pw9Nt7vp-CgpC-w=",
    cookTime: "25 min",
    servings: 2,
    rating: 4.8,
    difficulty: "Medium",
    category: "Lunch",
    description: "Trending street-style chicken shawarma wrap at home."
},
{
    id: 21,
    title: "Dalgona Coffee",
    video: "https://www.youtube.com/embed/bP9M_ljBInk",
    thumbnail: "https://media.istockphoto.com/id/1324007808/photo/dalgona-coffee-with-coffee-beans-on-table.webp?a=1&b=1&s=612x612&w=0&k=20&c=IJaDxwL_asxTI6jX1ldUpWjmYOfnJcuMgaUxfPYpWXI=",
    cookTime: "10 min",
    servings: 1,
    rating: 4.9,
    difficulty: "Easy",
    category: "Beverages",
    description: "Whipped coffee viral on TikTok."
},
{
    id: 22,
    title: "Mango Lassi",
    video: "https://www.youtube.com/embed/ImobOl622lk",
    thumbnail: "https://media.istockphoto.com/id/1175588957/photo/homemade-sweet-indian-mango-lassi.jpg?s=612x612&w=0&k=20&c=9Sl9ZI4uRB24tObSvJhXJcuH0fps-GkhE9rUp6ziO2s=",
    cookTime: "5 min",
    servings: 2,
    rating: 4.9,
    difficulty: "Easy",
    category: "Beverages",
    description: "Sweet and creamy mango yogurt drink trending online."
},
{
    id: 23,
    title: "Tomato Chutney",
    video: "https://www.youtube.com/embed/qDRLM0t71nU",
    thumbnail: "https://plus.unsplash.com/premium_photo-1664640733870-15cb6a5b6ee6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8VG9tYXRvJTIwQ2h1dG5leXxlbnwwfHwwfHx8MA%3D%3D",
    cookTime: "15 min",
    servings: 4,
    rating: 4.7,
    difficulty: "Easy",
    category: "Side Dish",
    description: "South Indian tomato chutney trending as a dosa/Idli dip."
},
{
    id: 24,
    title: "Iced Matcha Latte",
    video: "https://www.youtube.com/embed/LCF10W_tuig",
    thumbnail: "https://media.istockphoto.com/id/2160690084/photo/image-of-two-drinking-glasses-of-chilled-iced-matcha-lattes-two-toned-green-and-white-non.webp?a=1&b=1&s=612x612&w=0&k=20&c=7DjKDAFbg6dUKpF6A-4HAh94gnzZcfGm3zXivhIZnW8=",
    cookTime: "10 min",
    servings: 1,
    rating: 4.7,
    difficulty: "Easy",
    category: "Beverages",
    description: "Trendy iced green tea latte with milk and matcha powder."
},
{
    id: 25,
    title: "Mojito Mocktail",
    video: "https://www.youtube.com/embed/-WIOJbXTBOg",
    thumbnail: "https://media.istockphoto.com/id/1019323316/photo/mint-mojito-cocktail.webp?a=1&b=1&s=612x612&w=0&k=20&c=dW06MLrWMGoPjzfHB_Czk2kUHwQsbhN3s21058WKccE=",
    cookTime: "8 min",
    servings: 2,
    rating: 4.9,
    difficulty: "Easy",
    category: "Beverages",
    description: "Minty and refreshing viral mocktail."
},

 {
    id: 26,
    title: "Strawberry Smoothie",
    video: "https://www.youtube.com/embed/4zdvJvQwaaQ",
    thumbnail: "https://images.unsplash.com/photo-1622597468620-656aa1f981ea?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fFN0cmF3YmVycnklMjBTbW9vdGhpZXxlbnwwfHwwfHx8MA%3D%3D",
    cookTime: "5 min",
    servings: 1,
    rating: 4.7,
    difficulty: "Easy",
    category: "Beverages",
    description: "Healthy smoothie made with fresh strawberries and yogurt."
},
{
    id: 27,
    title: "Watermelon Juice",
    video: "https://www.youtube.com/embed/oV4ERaxT2qY",
    thumbnail: "https://media.istockphoto.com/id/2005482636/photo/fresh-watermelon-slices-with-watermelon-smoothie.jpg?s=612x612&w=0&k=20&c=EkzhoaxXkoxEH-YXwcv9_UdsBiYpDfzeQ0SZToICDs8=",
    cookTime: "5 min",
    servings: 2,
    rating: 4.8,
    difficulty: "Easy",
    category: "Beverages",
    description: "Refreshing summer drink made from fresh watermelon."
},
{
    id: 28,
    title: "Turmeric Golden Milk",
    video: "https://www.youtube.com/embed/RlsflNsM-eM",
    thumbnail: "https://media.istockphoto.com/id/912295248/photo/golden-milk-turmeric-latte-golden-latte.webp?a=1&b=1&s=612x612&w=0&k=20&c=2hijiuUOIBziL5liiRmmD4debAVR6s0IBUgf_kRT-fs=",
    cookTime: "10 min",
    servings: 2,
    rating: 4.8,
    difficulty: "Easy",
    category: "Beverages",
    description: "Warm and healthy golden milk with turmeric, viral on social media."
},
{
    id: 30,
    title: "Banana Milk Toast",
    video: "https://www.youtube.com/embed/rButWZWRock",
    thumbnail: "https://media.istockphoto.com/id/2209822857/photo/delicious-banana-caramel-toast-with-chocolate-sauce-strawberry-jam-grilled-toast-bread-and.webp?a=1&b=1&s=612x612&w=0&k=20&c=nc8NjoZjo0HgdvHzuz-V-XXKeV4UB4hBW7PmREX6UgY=",
    cookTime: "10 min",
    servings: 1,
    rating: 4.8,
    difficulty: "Easy",
    category: "Breakfast",
    description: "Viral sweet toast recipe made with banana, milk and sugar."
},
{
    id: 31,
    title: "Tortilla Quiche",
    video: "https://www.youtube.com/embed/-6CP78Pd8vQ",
    thumbnail: "https://media.istockphoto.com/id/1829029048/photo/crispy-air-fried-tortilla-quiche.jpg?s=612x612&w=0&k=20&c=u0H5xa5KAb2M82aKBNrJkwaCw4awu8dg-YQCiY4UP9U=",
    cookTime: "30 min",
    servings: 2,
    rating: 4.8,
    difficulty: "Medium",
    category: "Lunch",
    description: "TikTok viral tortilla quiche baked with eggs and veggies."
},
{
    id: 32,
    title: "Veg Manchurian Wrap",
    video: "https://www.youtube.com/embed/NvhEUyCoRhQ",
    thumbnail: "https://media.istockphoto.com/id/172174472/photo/healthy-wraps-that-are-ready-to-be-eaten.webp?a=1&b=1&s=612x612&w=0&k=20&c=3mm-d0hVfl8fZh7mW_0k80yPVqBn_4yxnduV1tu9Gts=",
    cookTime: "25 min",
    servings: 2,
    rating: 4.7,
    difficulty: "Medium",
    category: "Lunch",
    description: "Fusion of veg manchurian balls wrapped in paratha, trending street food."
},
{
    id: 33,
    title: "Ema Datshi",
    video: "https://www.youtube.com/embed/4bLj0lUGltI",
    thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLxJss1pcZnEXW5hpkLFRlzUgSfo8AwFVwpQ&s",
    cookTime: "35 min",
    servings: 3,
    rating: 4.7,
    difficulty: "Medium",
    category: "Dinner",
    description: "Traditional Bhutanese chili-cheese curry trending globally."
},
{
    id: 34,
    title: "Banana Crème Brûlée",
    video: "https://www.youtube.com/embed/qk_X6Gr_yYo",
    thumbnail: "https://www.beanilla.com/wp/wp-content/uploads/2013/06/bruleed-banana-split.jpg",
    cookTime: "40 min",
    servings: 4,
    rating: 4.9,
    difficulty: "Hard",
    category: "Dessert",
    description: "Viral French dessert with a banana twist."
},
{
    id: 35,
    title: "Ice Lollies",
    video: "https://www.youtube.com/embed/k7KmRemWG-0",
    thumbnail: "/images/img_1.png",
    cookTime: "15 min",
    servings: 4,
    rating: 4.7,
    difficulty: "Easy",
    category: "Dessert",
    description: "Refreshing homemade fruity ice lollies trending in summer."
},
{
    id: 36,
    title: "Caramel Tea",
    video: "https://www.youtube.com/embed/W4I7kVM14LM",
    thumbnail: "https://www.thebigsweettooth.com/wp-content/uploads/2020/10/17.-Caramel-Tea.jpg",
    cookTime: "10 min",
    servings: 1,
    rating: 4.7,
    difficulty: "Easy",
    category: "Beverages",
    description: "Sweet caramel flavored milk tea trending online."
},
{
    "id": 37,
    "title": "Sparkling Honey Palomas",
    "video": "https://www.youtube.com/embed/fiqG6luHnJI",
    "thumbnail": "/images/img.png",
    "cookTime": "8 min",
    "servings": 2,
    "rating": 4.8,
    "difficulty": "Easy",
    "category": "Beverages",
    "description": "Refreshing sparkling honey paloma mocktail trending."
}


];
const categories = ["All","Breakfast","Lunch","Dinner","Dessert","Snacks","Vegetarian","Quick & Easy","Beverages"];

// ---------------- Recipe Filters ----------------
const RecipeFilters = ({ selectedCategory, onCategoryChange }) => (
  <div className="recipe-filters">
    {categories.map((cat) => (
      <button
        key={cat}
        className={`filter-btn ${selectedCategory === cat ? "active" : ""}`}
        onClick={() => onCategoryChange(cat)}
      >
        {cat}
      </button>
    ))}
  </div>
);

// ---------------- Recipe Card ----------------
const RecipeCard = ({ recipe }) => {
  const openVideo = (url) => {
    window.open(url, "_blank"); // open video in new tab
  };

  return (
    <div className="recipe-card" onClick={() => openVideo(recipe.video)} style={{cursor:"pointer"}}>
      <img
        src={recipe.thumbnail}
        alt={recipe.title}
        style={{
          width: "100%",
          height: "180px",
          objectFit: "cover",
          borderRadius: "12px 12px 0 0"
        }}
      />
      <div className="recipe-info">
        <span className="category-badge">{recipe.category}</span>
        <h3>{recipe.title}</h3>
        <p>{recipe.description}</p>
        <div className="stats">
          <span>⏱ {recipe.cookTime}</span>
          <span>👥 {recipe.servings}</span>
          <span className="rating">
            {Array.from({length:5}, (_,i) => (
              <span key={i} style={{color: i < Math.round(recipe.rating) ? "#ffc107" : "#555"}}>★</span>
            ))}
          </span>
        </div>
        <span className={`difficulty ${recipe.difficulty.toLowerCase()}`}>{recipe.difficulty}</span>
      </div>
    </div>
  );
};

// ---------------- Hero Section ----------------
const HeroSection = ({ searchQuery, onSearchChange }) => (
  <section className="hero-section">
    <div className="hero-overlay">
      <h1>🔥 Trending Recipes</h1>
      <p>From viral TikTok sensations to chef-approved classics, find the recipes everyone's talking about.</p>
      <input type="text" placeholder="Search recipes..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
    </div>
  </section>
);

// ---------------- Main Component ----------------
const TrendingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredRecipes = trendingRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div style={{position:"sticky", top:0, zIndex:1000, width:"100%"}}>
        <Navbar />
      </div>
      <div className="trending-page">
        <style>{`
          body { margin:0; font-family:Arial,sans-serif; background:#1e1e1e; color:#fff; }
          .hero-section { position: relative; background: linear-gradient(135deg,#fc8019cc,#ff6b6bcc); padding:80px 20px; text-align:center; }
          .hero-section h1 { font-size:3rem; margin-bottom:1rem; color:#fff; }
          .hero-section p { font-size:1.2rem; margin-bottom:2rem; color:#ffe5cc; }
          .hero-section input { padding:0.8rem 1rem; font-size:1rem; border-radius:8px; border:none; width:300px; }
          .recipe-filters { display:flex; flex-wrap:wrap; justify-content:center; gap:10px; margin:20px 0; }
          .filter-btn { padding:0.5rem 1rem; border-radius:20px; border:2px solid #fc8019; background:transparent; color:#fc8019; cursor:pointer; transition:all 0.3s ease; }
          .filter-btn.active, .filter-btn:hover { background:#fc8019; color:#fff; }
          .recipes-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; padding:0 20px 40px 20px; }
          .recipe-card { position:relative; background:#2a2a2a; border-radius:12px; overflow:hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; }
          .recipe-card:hover { transform:translateY(-8px); box-shadow:0 12px 20px rgba(252,128,25,0.5); }
          .recipe-info { padding:15px; }
          .recipe-info h3 { margin:0 0 5px 0; font-size:1.2rem; color:#fc8019; }
          .recipe-info p { font-size:0.9rem; color:#ccc; margin-bottom:10px; }
          .stats { display:flex; justify-content:space-between; font-size:0.85rem; color:#ddd; margin-bottom:10px; }
          .rating span { font-size:1rem; margin-right:2px; }
          .category-badge { position:absolute; top:10px; right:10px; background:#fc801980; padding:3px 8px; border-radius:8px; font-size:0.75rem; }
          .difficulty { padding:2px 6px; border-radius:5px; font-size:0.75rem; }
          .difficulty.easy { background:#4caf50; color:#fff; }
          .difficulty.medium { background:#ff9800; color:#fff; }
          .difficulty.hard { background:#f44336; color:#fff; }
          .no-results { text-align:center; margin:40px 0; color:#ccc; font-size:1.2rem; }
          .trending-page {
    background: linear-gradient(to bottom, #1e1e1e, #121212);
}
        `}</style>

        <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <RecipeFilters selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        <div className="recipes-grid">
          {filteredRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
        </div>
        {filteredRecipes.length === 0 && <p className="no-results">No recipes found.</p>}
      </div>
    </>
  );
};

export default TrendingPage;