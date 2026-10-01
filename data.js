// Messwise Database & Seed Store
// Realistic campus data for college and hostel mess food-waste management

const INITIAL_HOSTELS = [
  {
    id: "h1",
    name: "Aryabhatta Boys Hostel",
    code: "ABH-Mess",
    capacity: 650,
    enrolledCount: 620,
    managerName: "Rajesh Kumar (Mess Supervisor)",
    phone: "+91 98765 43210",
    campusZone: "North Campus, Block D",
    baselineCookRatio: 1.0 // 100% capacity prepared traditionally
  },
  {
    id: "h2",
    name: "Tagore Dining Hall",
    code: "TDH-Central",
    capacity: 520,
    enrolledCount: 490,
    managerName: "Mrs. Meenakshi Sundaram",
    phone: "+91 98765 43211",
    campusZone: "Central Sector, Gate 2",
    baselineCookRatio: 0.98
  },
  {
    id: "h3",
    name: "Sarojini Girls Hostel",
    code: "SGH-Mess",
    capacity: 430,
    enrolledCount: 410,
    managerName: "Sunita Verma",
    phone: "+91 98765 43212",
    campusZone: "South Campus, Block A",
    baselineCookRatio: 0.95
  }
];

const VERIFIED_NGOS = [
  {
    id: "ngo-1",
    name: "Robin Hood Army - Campus Chapter",
    contactPerson: "Aarav Sharma (Chapter Lead)",
    phone: "+91 98112 34567",
    distanceKm: 2.1,
    avgResponseMinutes: 25,
    vehicleType: "2 Insulated Vans + 4 Two-wheelers",
    servingCapacity: "Up to 350 meals/batch",
    rating: 4.9,
    verifiedSince: "2022",
    targetBeneficiaries: "Community shelters near Railway Colony & Labor Settlements",
    activeStatus: "Ready for Pickup",
    fssaiRegistration: "FSSAI-NGO-2023-DEL-8921"
  },
  {
    id: "ngo-2",
    name: "Feeding India by Zomato (Local Hub)",
    contactPerson: "Priya Deshmukh",
    phone: "+91 98223 45678",
    distanceKm: 3.8,
    avgResponseMinutes: 35,
    vehicleType: "1 Refrigerated Minivan",
    servingCapacity: "Up to 500 meals/batch",
    rating: 4.85,
    verifiedSince: "2021",
    targetBeneficiaries: "Night shelters & municipal children homes",
    activeStatus: "On Standby",
    fssaiRegistration: "FSSAI-NGO-2021-MAH-4412"
  },
  {
    id: "ngo-3",
    name: "Annakshetra Relief Foundation",
    contactPerson: "Vikram Singhania",
    phone: "+91 98334 56789",
    distanceKm: 5.2,
    avgResponseMinutes: 45,
    vehicleType: "3 Delivery Cargo Vans",
    servingCapacity: "Up to 600 meals/batch",
    rating: 4.78,
    verifiedSince: "2023",
    targetBeneficiaries: "Old age homes and destitute ashrams",
    activeStatus: "Available",
    fssaiRegistration: "FSSAI-NGO-2023-UP-1029"
  }
];

const MENU_CATALOG = [
  {
    id: "m-paneer",
    name: "Shahi Paneer, Dal Makhani, Jeera Rice & Butter Naan",
    category: "Special Dinner",
    mealSession: "Dinner",
    popularityScore: 94, // Out of 100
    avgCostPerMeal: 52, // In INR (₹)
    ingredientsPer100Meals: [
      { item: "Paneer (Cottage Cheese)", qty: 15, unit: "kg" },
      { item: "Basmati Rice", qty: 12, unit: "kg" },
      { item: "Black Urad Dal (Dal Makhani)", qty: 8, unit: "kg" },
      { item: "Wheat Flour (Atta)", qty: 10, unit: "kg" },
      { item: "Tomatoes, Onions & Dairy Cream", qty: 18, unit: "kg" }
    ]
  },
  {
    id: "m-rajma",
    name: "Punjabi Rajma Masala, Steamed Rice, Phulka & Boondi Raita",
    category: "Standard Comfort",
    mealSession: "Lunch",
    popularityScore: 82,
    avgCostPerMeal: 40,
    ingredientsPer100Meals: [
      { item: "Kashmiri Rajma", qty: 12, unit: "kg" },
      { item: "Sona Masoori Rice", qty: 14, unit: "kg" },
      { item: "Wheat Flour (Atta)", qty: 12, unit: "kg" },
      { item: "Curd (Dahi) & Boondi", qty: 10, unit: "kg" },
      { item: "Onions, Tomatoes & Spices", qty: 14, unit: "kg" }
    ]
  },
  {
    id: "m-chole",
    name: "Chole Bhature / Poori with Aloo Masala & Onion Salad",
    category: "Weekend Brunch/Lunch",
    mealSession: "Lunch",
    popularityScore: 89,
    avgCostPerMeal: 44,
    ingredientsPer100Meals: [
      { item: "Kabuli Chana (Chickpeas)", qty: 14, unit: "kg" },
      { item: "Maida & Wheat Flour Blend", qty: 16, unit: "kg" },
      { item: "Potatoes", qty: 12, unit: "kg" },
      { item: "Cooking Oil (Refined)", qty: 7, unit: "L" }
    ]
  },
  {
    id: "m-thali-south",
    name: "Sambar, Lemon Rice, Poriyal, Rasam & Curd Rice",
    category: "Regional Special",
    mealSession: "Lunch",
    popularityScore: 78,
    avgCostPerMeal: 38,
    ingredientsPer100Meals: [
      { item: "Raw Rice", qty: 16, unit: "kg" },
      { item: "Toor Dal", qty: 9, unit: "kg" },
      { item: "Mixed Seasonal Veggies (Drumstick/Beans)", qty: 15, unit: "kg" },
      { item: "Curd & Seasoning", qty: 12, unit: "kg" }
    ]
  },
  {
    id: "m-khichdi",
    name: "Moong Dal Khichdi, Gujarati Kadhi, Papad & Aloo Gobhi",
    category: "Light/Simple",
    mealSession: "Dinner",
    popularityScore: 58, // lower popularity typically leads to higher waste if cooked statically
    avgCostPerMeal: 32,
    ingredientsPer100Meals: [
      { item: "Rice & Moong Dal Mix", qty: 18, unit: "kg" },
      { item: "Besan & Buttermilk (Kadhi)", qty: 10, unit: "kg" },
      { item: "Cauliflower & Potatoes", qty: 12, unit: "kg" }
    ]
  },
  {
    id: "m-biryani",
    name: "Hyderabadi Veg Dum Biryani, Mirchi Ka Salan & Raita",
    category: "Sunday Feast",
    mealSession: "Lunch",
    popularityScore: 96,
    avgCostPerMeal: 50,
    ingredientsPer100Meals: [
      { item: "Aged Basmati Rice", qty: 16, unit: "kg" },
      { item: "Mixed Veggies, Soy Chunks & Paneer", qty: 18, unit: "kg" },
      { item: "Curd & Mint Masala", qty: 12, unit: "kg" },
      { item: "Ghee & Fried Onions", qty: 5, unit: "kg" }
    ]
  }
];

// 30 days of representative historical mess attendance & waste data
const HISTORICAL_DATA_SEED = [
  {
    id: "log-01",
    date: "2026-08-15",
    hostelId: "h1",
    mealSession: "Lunch",
    dayOfWeek: "Saturday",
    academicEvent: "Independence Day Holiday",
    weather: "Sunny, 32°C",
    menuName: "Hyderabadi Veg Dum Biryani & Raita",
    menuPopularity: 96,
    preparedMeals: 650,
    actualMealsServed: 340, // massive overproduction due to students going home on long weekend!
    leftoverMeals: 310,
    leftoverKg: 108.5,
    actionTaken: "Redistributed via Robin Hood Army",
    prepCostINR: 32500,
    actualCostINR: 17000,
    financialWastedINR: 15500,
    wastedAvoidable: true
  },
  {
    id: "log-02",
    date: "2026-08-16",
    hostelId: "h1",
    mealSession: "Dinner",
    dayOfWeek: "Sunday",
    academicEvent: "Long Weekend (Holiday)",
    weather: "Pleasant, 28°C",
    menuName: "Moong Dal Khichdi, Kadhi & Papad",
    menuPopularity: 58,
    preparedMeals: 620,
    actualMealsServed: 290,
    leftoverMeals: 330,
    leftoverKg: 115.5,
    actionTaken: "Redistributed 220 meals, 110 composted",
    prepCostINR: 19840,
    actualCostINR: 9280,
    financialWastedINR: 10560,
    wastedAvoidable: true
  },
  {
    id: "log-03",
    date: "2026-08-17",
    hostelId: "h1",
    mealSession: "Lunch",
    dayOfWeek: "Monday",
    academicEvent: "Regular Classes",
    weather: "Humid, 30°C",
    menuName: "Punjabi Rajma Masala & Steamed Rice",
    menuPopularity: 82,
    preparedMeals: 630,
    actualMealsServed: 565,
    leftoverMeals: 65,
    leftoverKg: 22.8,
    actionTaken: "Redistributed to Night Shelter",
    prepCostINR: 25200,
    actualCostINR: 22600,
    financialWastedINR: 2600,
    wastedAvoidable: true
  },
  {
    id: "log-04",
    date: "2026-08-18",
    hostelId: "h1",
    mealSession: "Dinner",
    dayOfWeek: "Tuesday",
    academicEvent: "Mid-Term Exam Eve",
    weather: "Clear, 27°C",
    menuName: "Shahi Paneer & Butter Naan",
    menuPopularity: 94,
    preparedMeals: 640,
    actualMealsServed: 510, // Students skip dinner or order late night snacks in hostels
    leftoverMeals: 130,
    leftoverKg: 45.5,
    actionTaken: "Redistributed via Feeding India",
    prepCostINR: 33280,
    actualCostINR: 26520,
    financialWastedINR: 6760,
    wastedAvoidable: true
  },
  {
    id: "log-05",
    date: "2026-08-19",
    hostelId: "h1",
    mealSession: "Lunch",
    dayOfWeek: "Wednesday",
    academicEvent: "Mid-Term Examinations",
    weather: "Rainy, 25°C",
    menuName: "Sambar, Rice & Poriyal",
    menuPopularity: 78,
    preparedMeals: 620,
    actualMealsServed: 430, // Exam afternoon, many study in library
    leftoverMeals: 190,
    leftoverKg: 66.5,
    actionTaken: "Redistributed to Annakshetra",
    prepCostINR: 23560,
    actualCostINR: 16340,
    financialWastedINR: 7220,
    wastedAvoidable: true
  },
  {
    id: "log-06",
    date: "2026-08-20",
    hostelId: "h1",
    mealSession: "Dinner",
    dayOfWeek: "Thursday",
    academicEvent: "Mid-Term Examinations",
    weather: "Clear, 26°C",
    menuName: "Moong Dal Khichdi, Kadhi & Aloo",
    menuPopularity: 58,
    preparedMeals: 580,
    actualMealsServed: 385,
    leftoverMeals: 195,
    leftoverKg: 68.2,
    actionTaken: "Redistributed to Old Age Home",
    prepCostINR: 18560,
    actualCostINR: 12320,
    financialWastedINR: 6240,
    wastedAvoidable: true
  },
  {
    id: "log-07",
    date: "2026-08-21",
    hostelId: "h1",
    mealSession: "Dinner",
    dayOfWeek: "Friday",
    academicEvent: "Weekend Outing (Regular)",
    weather: "Pleasant, 27°C",
    menuName: "Shahi Paneer & Naan",
    menuPopularity: 94,
    preparedMeals: 640,
    actualMealsServed: 475,
    leftoverMeals: 165,
    leftoverKg: 57.8,
    actionTaken: "Redistributed to Robin Hood Army",
    prepCostINR: 33280,
    actualCostINR: 24700,
    financialWastedINR: 8580,
    wastedAvoidable: true
  },
  {
    id: "log-08",
    date: "2026-08-22",
    hostelId: "h1",
    mealSession: "Lunch",
    dayOfWeek: "Saturday",
    academicEvent: "College Cultural Fest - Day 1",
    weather: "Sunny, 31°C",
    menuName: "Chole Bhature & Poori",
    menuPopularity: 89,
    preparedMeals: 650,
    actualMealsServed: 635, // High turnout during festival!
    leftoverMeals: 15,
    leftoverKg: 5.2,
    actionTaken: "Staff consumption",
    prepCostINR: 28600,
    actualCostINR: 27940,
    financialWastedINR: 660,
    wastedAvoidable: false
  },
  {
    id: "log-09",
    date: "2026-08-23",
    hostelId: "h1",
    mealSession: "Lunch",
    dayOfWeek: "Sunday",
    academicEvent: "College Cultural Fest - Day 2",
    weather: "Sunny, 32°C",
    menuName: "Hyderabadi Veg Dum Biryani",
    menuPopularity: 96,
    preparedMeals: 650,
    actualMealsServed: 642,
    leftoverMeals: 8,
    leftoverKg: 2.8,
    actionTaken: "Zero edible waste",
    prepCostINR: 32500,
    actualCostINR: 32100,
    financialWastedINR: 400,
    wastedAvoidable: false
  },
  {
    id: "log-10",
    date: "2026-09-01",
    hostelId: "h1",
    mealSession: "Lunch",
    dayOfWeek: "Tuesday",
    academicEvent: "Regular Classes",
    weather: "Clear, 29°C",
    menuName: "Punjabi Rajma Masala & Steamed Rice",
    menuPopularity: 82,
    // When AI recommendation was piloted:
    preparedMeals: 560, // AI suggested 560 instead of 650!
    actualMealsServed: 548,
    leftoverMeals: 12,
    leftoverKg: 4.2,
    actionTaken: "Overproduction prevented: 90 meals saved at source",
    prepCostINR: 22400,
    actualCostINR: 21920,
    financialWastedINR: 480,
    wastedAvoidable: false
  }
];

// Active Redistribution Requests in System
const INITIAL_REDISTRIBUTION_REQUESTS = [
  {
    id: "REQ-2026-0913-01",
    hostelId: "h1",
    hostelName: "Aryabhatta Boys Hostel",
    mealSession: "Lunch",
    date: "2026-09-13",
    foodItems: [
      { name: "Steamed Basmati Rice", qtyKg: 14, portions: 40 },
      { name: "Dal Makhani (Untouched Batch)", qtyKg: 10, portions: 40 },
      { name: "Phulkas/Roti (Hot case sealed)", qtyKg: 6, portions: 35 }
    ],
    totalPortions: 40,
    totalKg: 30,
    dietaryType: "100% Pure Vegetarian",
    preparationCompletedAt: "13:30",
    safetyCheckedAt: "14:45",
    safetyWindowMinutes: 240, // 4 hours from prep
    safetyRemainingMinutes: 105, // Live countdown
    temperatureCelsius: 64.5, // Hot-held > 60°C
    fssaiCriteriaPassed: true,
    inspectorName: "Rajesh Kumar (Mess Supervisor)",
    status: "Accepted - Volunteer En Route", // "Pending Dispatch", "Accepted - Volunteer En Route", "Verified & Handed Over", "Distributed"
    assignedNgoId: "ngo-1",
    assignedNgoName: "Robin Hood Army - Campus Chapter",
    volunteerName: "Kunal Verma & Team",
    volunteerContact: "+91 98711 22334",
    volunteerEtaMinutes: 14,
    handoverOtp: "4829",
    otpVerified: false,
    destinationShelter: "Sarai Kale Khan Night Shelter #3"
  }
];

window.MESSWISE_DATA = {
  hostels: INITIAL_HOSTELS,
  ngos: VERIFIED_NGOS,
  menuCatalog: MENU_CATALOG,
  history: HISTORICAL_DATA_SEED,
  redistributions: INITIAL_REDISTRIBUTION_REQUESTS
};
