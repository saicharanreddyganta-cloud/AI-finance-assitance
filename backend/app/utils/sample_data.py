from sqlalchemy.orm import Session
from app.models.models import User, Transaction, FinancialGoal, Investment, Receipt, UserSettings, Category
from app.utils.auth_utils import get_password_hash

def seed_demo_data(db: Session):
    # Check if demo user already exists
    demo_user = db.query(User).filter(User.email == "demo@finsight.ai").first()
    if demo_user:
        return demo_user

    demo_user = User(
        email="demo@finsight.ai",
        hashed_password=get_password_hash("Demo@123"),
        full_name="Rahul Sharma",
        is_active=True
    )
    db.add(demo_user)
    db.flush()

    # User Settings
    settings = UserSettings(
        user_id=demo_user.id,
        currency="₹",
        monthly_budget=35000.0,
        emergency_fund_target=100000.0,
        risk_tolerance="Moderate",
        notifications_enabled=True,
        ai_suggestions_enabled=True,
        dark_mode=False
    )
    db.add(settings)

    # Pre-populate Categories
    categories_data = [
        ("Food", "Expense", "Utensils", "#F59E0B"),
        ("Shopping", "Expense", "ShoppingBag", "#EC4899"),
        ("Transport", "Expense", "Car", "#3B82F6"),
        ("Bills", "Expense", "FileText", "#8B5CF6"),
        ("Entertainment", "Expense", "Tv", "#6366F1"),
        ("Healthcare", "Expense", "Activity", "#10B981"),
        ("Education", "Expense", "BookOpen", "#14B8A6"),
        ("Travel", "Expense", "Plane", "#0EA5E9"),
        ("Salary", "Income", "DollarSign", "#22C55E"),
        ("Investment", "Expense", "TrendingUp", "#A855F7"),
        ("Other", "Expense", "MoreHorizontal", "#64748B"),
    ]
    for c_name, c_type, c_icon, c_color in categories_data:
        existing = db.query(Category).filter(Category.name == c_name).first()
        if not existing:
            db.add(Category(name=c_name, type=c_type, icon=c_icon, color=c_color))

    # Multi-month transaction dataset (Jan 2026 to Jun 2026)
    # Target Current Month Totals: Income ₹50,000, Food ₹8,200, Shopping ₹5,670, Transport ₹3,780, Bills ₹2,150, Entertainment ₹2,930, Others ₹8,770 => Total Expense ₹31,500, Savings ₹18,500
    transactions = [
        # --- Current Month (Jun 2026) ---
        Transaction(user_id=demo_user.id, date="2026-06-01", description="Monthly Salary Credit Tech Corp", amount=50000.0, type="Income", category="Salary", payment_method="Bank Transfer", notes="Direct payroll credit"),
        Transaction(user_id=demo_user.id, date="2026-06-02", description="Swiggy Gourmet Dinner", amount=650.0, type="Expense", category="Food", payment_method="UPI", notes="Family dinner order"),
        Transaction(user_id=demo_user.id, date="2026-06-03", description="Uber City Ride", amount=430.0, type="Expense", category="Transport", payment_method="UPI", notes="Office commute"),
        Transaction(user_id=demo_user.id, date="2026-06-04", description="BigBasket Monthly Groceries", amount=3850.0, type="Expense", category="Food", payment_method="Credit Card", notes="Kitchen staples & vegetables"),
        Transaction(user_id=demo_user.id, date="2026-06-05", description="Electricity Bill BESCOM", amount=1450.0, type="Expense", category="Bills", payment_method="UPI", notes="Monthly power utility"),
        Transaction(user_id=demo_user.id, date="2026-06-06", description="Amazon Purchase Electronics & Cable", amount=2450.0, type="Expense", category="Shopping", payment_method="Credit Card", notes="Ergonomic mouse & cables"),
        Transaction(user_id=demo_user.id, date="2026-06-07", description="Netflix Premium 4K UHD", amount=649.0, type="Expense", category="Entertainment", payment_method="Debit Card", notes="Monthly family plan"),
        Transaction(user_id=demo_user.id, date="2026-06-08", description="Starbucks Coffee & Snacks", amount=720.0, type="Expense", category="Food", payment_method="UPI", notes="Meeting refreshments"),
        Transaction(user_id=demo_user.id, date="2026-06-10", description="Shell Petrol Station Refuel", amount=2150.0, type="Expense", category="Transport", payment_method="Credit Card", notes="Full tank fuel"),
        Transaction(user_id=demo_user.id, date="2026-06-11", description="Airtel Broadband Wifi Bill", amount=700.0, type="Expense", category="Bills", payment_method="UPI", notes="Fiber 200Mbps bill"),
        Transaction(user_id=demo_user.id, date="2026-06-12", description="Zomato Weekend Biryani Order", amount=980.0, type="Expense", category="Food", payment_method="UPI", notes="Weekend dine-in delivery"),
        Transaction(user_id=demo_user.id, date="2026-06-14", description="Myntra Casual Shirts & Shoes", amount=3220.0, type="Expense", category="Shopping", payment_method="Credit Card", notes="Summer wardrobe"),
        Transaction(user_id=demo_user.id, date="2026-06-15", description="Cult.fit Gym & Fitness Pass", amount=2500.0, type="Expense", category="Healthcare", payment_method="UPI", notes="Monthly fitness pass"),
        Transaction(user_id=demo_user.id, date="2026-06-16", description="Apollo Pharmacy Health Check Supplements", amount=1270.0, type="Expense", category="Healthcare", payment_method="Debit Card", notes="Vitamins & essentials"),
        Transaction(user_id=demo_user.id, date="2026-06-17", description="Blinkit Fresh Snacks & Milk", amount=850.0, type="Expense", category="Food", payment_method="UPI", notes="Quick daily supplies"),
        Transaction(user_id=demo_user.id, date="2026-06-18", description="Ola Cabs Airport Drop", amount=850.0, type="Expense", category="Transport", payment_method="UPI", notes="Business airport commute"),
        Transaction(user_id=demo_user.id, date="2026-06-20", description="PVR IMAX Cinema Tickets & Combo", amount=1280.0, type="Expense", category="Entertainment", payment_method="UPI", notes="Weekend sci-fi movie"),
        Transaction(user_id=demo_user.id, date="2026-06-21", description="Spotify Premium Duo Subscription", amount=149.0, type="Expense", category="Entertainment", payment_method="UPI", notes="Music streaming"),
        Transaction(user_id=demo_user.id, date="2026-06-22", description="BookMyShow Live Theatre Play", amount=852.0, type="Expense", category="Entertainment", payment_method="Credit Card", notes="Cultural event passes"),
        Transaction(user_id=demo_user.id, date="2026-06-23", description="Fastrack Metro Smart Card Recharge", amount=350.0, type="Expense", category="Transport", payment_method="UPI", notes="Metro transit"),
        Transaction(user_id=demo_user.id, date="2026-06-24", description="Nature's Basket Gourmet Cheese & Dry Fruits", amount=1150.0, type="Expense", category="Food", payment_method="Debit Card", notes="Weekend snacks"),
        Transaction(user_id=demo_user.id, date="2026-06-25", description="Home Appliance Maintenance Service", amount=2200.0, type="Expense", category="Other", payment_method="Cash", notes="AC servicing"),
        Transaction(user_id=demo_user.id, date="2026-06-26", description="Books & Online Learning Subscription", amount=1800.0, type="Expense", category="Education", payment_method="Credit Card", notes="Technical manuals"),
        Transaction(user_id=demo_user.id, date="2026-06-27", description="Personal Grooming Salon & Spa", amount=1000.0, type="Expense", category="Other", payment_method="UPI", notes="Monthly grooming"),

        # --- Month 5 (May 2026) ---
        Transaction(user_id=demo_user.id, date="2026-05-01", description="Monthly Salary Credit Tech Corp", amount=50000.0, type="Income", category="Salary", payment_method="Bank Transfer"),
        Transaction(user_id=demo_user.id, date="2026-05-04", description="Food & Dining Expenses May", amount=7300.0, type="Expense", category="Food", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-05-08", description="Amazon Summer Shopping", amount=5900.0, type="Expense", category="Shopping", payment_method="Credit Card"),
        Transaction(user_id=demo_user.id, date="2026-05-12", description="Commute & Fuel Expenses May", amount=3400.0, type="Expense", category="Transport", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-05-15", description="Utility Bills May", amount=2100.0, type="Expense", category="Bills", payment_method="Bank Transfer"),
        Transaction(user_id=demo_user.id, date="2026-05-20", description="Movies & Subscriptions May", amount=2600.0, type="Expense", category="Entertainment", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-05-25", description="Healthcare & Misc May", amount=8900.0, type="Expense", category="Other", payment_method="Debit Card"),

        # --- Month 4 (Apr 2026) ---
        Transaction(user_id=demo_user.id, date="2026-04-01", description="Monthly Salary Credit Tech Corp", amount=50000.0, type="Income", category="Salary", payment_method="Bank Transfer"),
        Transaction(user_id=demo_user.id, date="2026-04-05", description="Food Outflow Apr", amount=7100.0, type="Expense", category="Food", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-04-10", description="Retail Shopping Apr", amount=5200.0, type="Expense", category="Shopping", payment_method="Credit Card"),
        Transaction(user_id=demo_user.id, date="2026-04-14", description="Transport Outflow Apr", amount=3200.0, type="Expense", category="Transport", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-04-18", description="Bills & Connectivity Apr", amount=2050.0, type="Expense", category="Bills", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-04-22", description="Entertainment Apr", amount=2450.0, type="Expense", category="Entertainment", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-04-26", description="Wellness & Other Apr", amount=8800.0, type="Expense", category="Other", payment_method="Cash"),

        # --- Month 3 (Mar 2026) ---
        Transaction(user_id=demo_user.id, date="2026-03-01", description="Monthly Salary Credit Tech Corp", amount=50000.0, type="Income", category="Salary", payment_method="Bank Transfer"),
        Transaction(user_id=demo_user.id, date="2026-03-05", description="Food & Groceries Mar", amount=7500.0, type="Expense", category="Food", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-03-12", description="Shopping & Clothing Mar", amount=5400.0, type="Expense", category="Shopping", payment_method="Credit Card"),
        Transaction(user_id=demo_user.id, date="2026-03-16", description="Transport Fuel & Cabs Mar", amount=3600.0, type="Expense", category="Transport", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-03-20", description="Utilities Mar", amount=2200.0, type="Expense", category="Bills", payment_method="Bank Transfer"),
        Transaction(user_id=demo_user.id, date="2026-03-24", description="Entertainment Mar", amount=2700.0, type="Expense", category="Entertainment", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-03-28", description="Household & Healthcare Mar", amount=9100.0, type="Expense", category="Other", payment_method="Debit Card"),

        # --- Month 2 (Feb 2026) ---
        Transaction(user_id=demo_user.id, date="2026-02-01", description="Monthly Salary Credit Tech Corp", amount=50000.0, type="Income", category="Salary", payment_method="Bank Transfer"),
        Transaction(user_id=demo_user.id, date="2026-02-06", description="Food Outflow Feb", amount=6900.0, type="Expense", category="Food", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-02-12", description="Shopping Feb", amount=5100.0, type="Expense", category="Shopping", payment_method="Credit Card"),
        Transaction(user_id=demo_user.id, date="2026-02-18", description="Transport Feb", amount=3100.0, type="Expense", category="Transport", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-02-22", description="Bills & Wifi Feb", amount=2000.0, type="Expense", category="Bills", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-02-25", description="Entertainment Feb", amount=2300.0, type="Expense", category="Entertainment", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-02-28", description="General & Medical Feb", amount=8500.0, type="Expense", category="Other", payment_method="Debit Card"),

        # --- Month 1 (Jan 2026) ---
        Transaction(user_id=demo_user.id, date="2026-01-01", description="Monthly Salary Credit Tech Corp", amount=50000.0, type="Income", category="Salary", payment_method="Bank Transfer"),
        Transaction(user_id=demo_user.id, date="2026-01-08", description="Food & Groceries Jan", amount=6800.0, type="Expense", category="Food", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-01-14", description="New Year Shopping Jan", amount=6200.0, type="Expense", category="Shopping", payment_method="Credit Card"),
        Transaction(user_id=demo_user.id, date="2026-01-18", description="Transport Jan", amount=3000.0, type="Expense", category="Transport", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-01-22", description="Bills Jan", amount=1950.0, type="Expense", category="Bills", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-01-26", description="Entertainment Jan", amount=2200.0, type="Expense", category="Entertainment", payment_method="UPI"),
        Transaction(user_id=demo_user.id, date="2026-01-30", description="Miscellaneous Jan", amount=8400.0, type="Expense", category="Other", payment_method="Cash"),
    ]
    for tx in transactions:
        db.add(tx)

    # Financial Goals
    goals = [
        FinancialGoal(
            user_id=demo_user.id,
            name="Laptop",
            target_amount=60000.0,
            current_amount=15000.0,
            target_date="2026-12-31",
            monthly_contribution=7500.0,
            category="Tech & Gadgets",
            status="In Progress"
        ),
        FinancialGoal(
            user_id=demo_user.id,
            name="Travel",
            target_amount=60000.0,
            current_amount=36000.0,
            target_date="2026-10-15",
            monthly_contribution=6000.0,
            category="Vacation",
            status="In Progress"
        ),
        FinancialGoal(
            user_id=demo_user.id,
            name="Emergency Fund",
            target_amount=100000.0,
            current_amount=40000.0,
            target_date="2027-03-31",
            monthly_contribution=10000.0,
            category="Emergency Cushion",
            status="In Progress"
        )
    ]
    for g in goals:
        db.add(g)

    # Investments (Total Invested: ₹3,50,000, Current Value: ₹4,20,000, Gain: ₹70,000, Return: 20%)
    investments = [
        Investment(
            user_id=demo_user.id,
            name="Nifty 50 Index Mutual Fund",
            type="Mutual Fund",
            invested_amount=150000.0,
            current_value=185000.0,
            purchase_date="2025-01-15",
            notes="Direct plan, regular monthly SIP"
        ),
        Investment(
            user_id=demo_user.id,
            name="Bluechip Equity Portfolio (TCS, Infosys, Reliance)",
            type="Stock",
            invested_amount=100000.0,
            current_value=126000.0,
            purchase_date="2025-03-20",
            notes="Held via Zerodha demat"
        ),
        Investment(
            user_id=demo_user.id,
            name="SBI Special Fixed Deposit",
            type="FD",
            invested_amount=60000.0,
            current_value=66000.0,
            purchase_date="2025-06-10",
            notes="7.25% p.a. compounded quarterly"
        ),
        Investment(
            user_id=demo_user.id,
            name="Sovereign Gold Bonds (SGB)",
            type="Gold",
            invested_amount=40000.0,
            current_value=43000.0,
            purchase_date="2025-08-01",
            notes="2.5% annual coupon yield"
        ),
    ]
    for inv in investments:
        db.add(inv)

    # Receipts Demo
    receipts = [
        Receipt(
            user_id=demo_user.id,
            filename="foodmart_grocery_02jun.jpg",
            merchant="Food Mart Supermarket",
            date="2026-06-02",
            amount=660.0,
            category="Food",
            tax=31.40,
            items_json='[{"name": "Fresh Paneer 200g", "price": 120, "quantity": 1}, {"name": "Whole Wheat Bread", "price": 50, "quantity": 1}, {"name": "Organic Milk 1L", "price": 150, "quantity": 2}, {"name": "Farm Fresh Vegetables", "price": 340, "quantity": 1}]',
            status="Confirmed",
            raw_text="FOOD MART SUPERMARKET\nRetail Tax Invoice\nDate: 2026-06-02\nPaneer 200g: 120.00\nBread: 50.00\nMilk 1L (x2): 150.00\nVegetables: 340.00\nTOTAL AMOUNT: Rs 660.00"
        ),
        Receipt(
            user_id=demo_user.id,
            filename="uber_airport_ride.jpg",
            merchant="Uber India Systems",
            date="2026-06-03",
            amount=430.0,
            category="Transport",
            tax=21.50,
            items_json='[{"name": "Uber Go Ride Fare", "price": 380, "quantity": 1}, {"name": "Toll & Airport Surcharge", "price": 50, "quantity": 1}]',
            status="Confirmed",
            raw_text="UBER INDIA SYSTEMS PVT LTD\nTrip Fare: Rs 380.00\nToll Charge: Rs 50.00\nTotal Paid: Rs 430.00 (UPI)\nDate: 2026-06-03"
        )
    ]
    for r in receipts:
        db.add(r)

    db.commit()
    return demo_user
