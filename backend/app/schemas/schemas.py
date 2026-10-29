from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

# --- Transaction Schemas ---
class TransactionBase(BaseModel):
    date: str
    description: str
    amount: float
    type: str  # "Income" or "Expense"
    category: str
    payment_method: str = "UPI"
    notes: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    date: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Financial Goal Schemas ---
class GoalBase(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0.0
    target_date: str
    monthly_contribution: float = 0.0
    category: str = "Savings"
    status: str = "In Progress"

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    target_date: Optional[str] = None
    monthly_contribution: Optional[float] = None
    category: Optional[str] = None
    status: Optional[str] = None

class GoalResponse(GoalBase):
    id: int
    user_id: int
    progress_percentage: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True

# --- Investment Schemas ---
class InvestmentBase(BaseModel):
    name: str
    type: str  # Stock, Mutual Fund, FD, Gold, Others
    invested_amount: float
    current_value: float
    purchase_date: Optional[str] = None
    notes: Optional[str] = None

class InvestmentCreate(InvestmentBase):
    pass

class InvestmentUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    invested_amount: Optional[float] = None
    current_value: Optional[float] = None
    purchase_date: Optional[str] = None
    notes: Optional[str] = None

class InvestmentResponse(InvestmentBase):
    id: int
    user_id: int
    gain_loss: float = 0.0
    return_percentage: float = 0.0
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Receipt Schemas ---
class ReceiptItem(BaseModel):
    name: str
    price: float
    quantity: Optional[int] = 1

class ReceiptResponse(BaseModel):
    id: int
    filename: str
    merchant: Optional[str]
    date: Optional[str]
    amount: float
    category: str
    tax: float
    items: List[Any]
    status: str
    raw_text: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ReceiptConfirmRequest(BaseModel):
    receipt_id: int
    merchant: str
    date: str
    amount: float
    category: str
    payment_method: str = "UPI"
    notes: Optional[str] = None

# --- Chat Schemas ---
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    role: str = "assistant"
    content: str
    timestamp: datetime = datetime.utcnow()
    suggested_actions: Optional[List[str]] = None

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- AIML Categorization Schemas ---
class AICategorizeRequest(BaseModel):
    description: str
    amount: Optional[float] = None
    merchant: Optional[str] = None

class AICategorizeResponse(BaseModel):
    category: str
    subcategory: str
    confidence: float
    detected_merchant: str
    detected_keywords: List[str]
    amount_pattern: str
    model_name: str = "Random Forest + TF-IDF Vectorizer"

class GoalOptimizationSuggestion(BaseModel):
    id: str
    category: str
    potential_savings: float
    tip: str
    action: str
    accepted: bool = False

# --- Analytics & Dashboard Schemas ---
class FinancialSummaryCard(BaseModel):
    title: str
    amount: float
    previous_amount: float
    change_percentage: float
    trend: str  # "up", "down", "neutral"

class CategorySpending(BaseModel):
    category: str
    amount: float
    percentage: float
    color: str

class CashFlowPoint(BaseModel):
    month: str
    income: float
    expense: float
    savings: float

class DashboardSummaryResponse(BaseModel):
    user_name: str
    greeting: str
    total_income: float
    total_expenses: float
    savings: float
    current_balance: float
    income_change_pct: float
    expense_change_pct: float
    savings_change_pct: float
    balance_change_pct: float
    spending_by_category: List[CategorySpending]
    cash_flow_trend: List[CashFlowPoint]
    recent_transactions: List[TransactionResponse]
    insights: List[str]

class RiskIndicator(BaseModel):
    name: str
    level: str  # "Low", "Medium", "High"
    color: str  # green, amber, red
    reason: str
    supporting_metric: str
    suggested_action: str

class RiskAssessmentResponse(BaseModel):
    overall_score: int
    overall_status: str
    indicators: List[RiskIndicator]
    updated_at: str

# --- Forecasting Schemas ---
class ForecastDataPoint(BaseModel):
    month: str
    historical_expense: Optional[float] = None
    forecast_expense: Optional[float] = None
    historical_income: Optional[float] = None
    forecast_income: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None

class CategoryForecast(BaseModel):
    category: str
    current_month: float
    predicted_next_month: float
    change_pct: float

class ForecastResponse(BaseModel):
    next_month_expense: float
    expected_savings: float
    confidence_score: float
    model_used: str
    trend_direction: str
    points: List[ForecastDataPoint]
    category_forecasts: List[CategoryForecast]
    insights: List[str]

# --- User Settings Schemas ---
class UserSettingsResponse(BaseModel):
    currency: str
    monthly_budget: float
    emergency_fund_target: float
    risk_tolerance: str
    notifications_enabled: bool
    ai_suggestions_enabled: bool
    dark_mode: bool

    class Config:
        from_attributes = True

class UserSettingsUpdate(BaseModel):
    currency: Optional[str] = None
    monthly_budget: Optional[float] = None
    emergency_fund_target: Optional[float] = None
    risk_tolerance: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    ai_suggestions_enabled: Optional[bool] = None
    dark_mode: Optional[bool] = None
