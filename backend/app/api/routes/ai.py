from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Booking, TransportRequest, AIRecommendation, User
from app.schemas import AIExplainRequest, AIExplainResponse, AIAssistantRequest, AIAssistantResponse
from app.ai.groq_service import explain_recommendation, answer_assistant

router = APIRouter(prefix="/api/ai", tags=["AI"])


@router.post("/explain-recommendation", response_model=AIExplainResponse)
def explain(data: AIExplainRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    req = db.query(TransportRequest).filter(TransportRequest.id == data.request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    ai_rec = db.query(AIRecommendation).filter(AIRecommendation.request_id == data.request_id).first()

    # Return cached explanation if available
    if ai_rec and ai_rec.groq_explanation:
        return AIExplainResponse(explanation=ai_rec.groq_explanation, used_groq=ai_rec.used_groq)

    return AIExplainResponse(
        explanation="Run Smart Match first to generate a recommendation explanation.",
        used_groq=False,
    )


@router.post("/assistant", response_model=AIAssistantResponse)
def assistant(data: AIAssistantRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    context = {}

    target_req_id = data.context_request_id
    if not target_req_id:
        latest_req = (
            db.query(TransportRequest)
            .filter(TransportRequest.business_id == current_user.id)
            .order_by(TransportRequest.created_at.desc())
            .first()
        )
        if not latest_req:
            latest_req = db.query(TransportRequest).order_by(TransportRequest.created_at.desc()).first()
        if latest_req:
            target_req_id = latest_req.id

    if target_req_id:
        req = db.query(TransportRequest).filter(TransportRequest.id == target_req_id).first()
        if req:
            context["route"] = f"{req.pickup_location} → {req.destination}"
            context["cargo"] = f"{req.cargo_weight_kg} kg {req.cargo_type}"
            if req.cargo_dimensions:
                context["cargo_dimensions"] = req.cargo_dimensions
            context["priority"] = req.priority.value if req.priority else "NORMAL"

            from app.models import Provider, Vehicle, MLPrediction
            preds = (
                db.query(MLPrediction, Vehicle, Provider)
                .join(Vehicle, MLPrediction.vehicle_id == Vehicle.id)
                .join(Provider, Vehicle.provider_id == Provider.id)
                .filter(MLPrediction.request_id == target_req_id)
                .all()
            )

            options_info = []
            for pred, veh, prov in preds:
                options_info.append(
                    f"{prov.company_name} ({veh.vehicle_type}): Cost=₹{pred.predicted_cost:,.0f}, "
                    f"ETA={pred.predicted_eta_hours:.1f}h, Capacity={veh.capacity_kg:.0f}kg, "
                    f"Suitability={pred.suitability_score:.0f}/100, Reliability={prov.reliability_score:.0f}%"
                )
            if options_info:
                context["evaluated_options"] = "\n".join(options_info)

            ai_rec = db.query(AIRecommendation).filter(AIRecommendation.request_id == target_req_id).first()
            if ai_rec:
                rec_prov = db.query(Provider).filter(Provider.id == ai_rec.recommended_provider_id).first()
                context["recommended_provider"] = rec_prov.company_name if rec_prov else "Unknown"
                context["match_score"] = f"{ai_rec.match_score:.0f}/100" if ai_rec.match_score else "N/A"
                if ai_rec.groq_explanation:
                    context["why_recommended"] = ai_rec.groq_explanation

            booking = db.query(Booking).filter(Booking.request_id == target_req_id).first()
            if booking:
                context["predicted_cost"] = f"₹{booking.quoted_price:,.0f}"
                context["predicted_eta_hours"] = f"{booking.estimated_eta_hours:.1f} hours"
                context["booking_status"] = booking.status.value

    reply, used_groq = answer_assistant(data.message, context)
    return AIAssistantResponse(reply=reply, used_groq=used_groq)


@router.get("/health")
def ai_health():
    from app.core.config import settings
    return {
        "groq_configured": bool(settings.GROQ_API_KEY),
        "status": "operational"
    }


@router.get("/ml-status")
def ml_health():
    import sys
    from pathlib import Path
    repo_root = Path(__file__).resolve().parents[4]
    if str(repo_root) not in sys.path:
        sys.path.insert(0, str(repo_root))
    from ml.inference.predict import models_loaded
    return models_loaded()
