from typing import Optional, Dict, Any
from app.ml.categorization_model import categorizer

class CategorizationService:
    @staticmethod
    def categorize_transaction(description: str, amount: Optional[float] = 0.0, merchant: Optional[str] = None) -> Dict[str, Any]:
        query_text = f"{merchant} {description}" if merchant else description
        result = categorizer.predict(query_text, amount=amount or 0.0)
        return result

categorization_service = CategorizationService()
