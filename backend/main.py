from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib

app = FastAPI(title="Eco-Friendly AI Predictor API")

# Setup CORS to allow the frontend to access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the allowed origins (e.g., your Vercel URL)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model and vectorizer
try:
    model = joblib.load("eco_model.pkl")
    vectorizer = joblib.load("vectorizer.pkl")
    print("Model and vectorizer loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")
    model = None
    vectorizer = None

# Input data model
class PredictionRequest(BaseModel):
    text: str

# Response data model
class PredictionResponse(BaseModel):
    is_eco_friendly: bool
    prediction_raw: int
    confidence: float | None = None

@app.get("/")
def read_root():
    return {"message": "Welcome to the Eco-Friendly AI Predictor API"}

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    if model is None or vectorizer is None:
        return {"error": "Models are not loaded correctly on the server."}
    
    # Vectorize the input text
    vec_text = vectorizer.transform([request.text])
    
    # Predict using the model
    prediction = model.predict(vec_text)
    
    # Try to get prediction probabilities if available
    try:
        probabilities = model.predict_proba(vec_text)
        confidence = float(max(probabilities[0]))
    except (AttributeError, Exception):
        confidence = None

    # The label is 1 for eco-friendly, 0 for not
    is_eco = bool(prediction[0] == 1)
    
    return PredictionResponse(
        is_eco_friendly=is_eco,
        prediction_raw=int(prediction[0]),
        confidence=confidence
    )
