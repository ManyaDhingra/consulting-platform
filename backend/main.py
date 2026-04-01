from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
import pandas as pd
import os
from openai import OpenAI
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 👈 important
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Home Route
# -------------------------------
@app.get("/")
def home():
    return {"message": "Consulting Insight Backend Running 🚀"}


# -------------------------------
# Upload & Preview Data
# -------------------------------
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)

    return {
        "message": "File uploaded successfully",
        "columns": list(df.columns),
        "rows": len(df),
        "preview": df.head(5).to_dict()
    }


# -------------------------------
# Validate Data
# -------------------------------
@app.post("/validate")
async def validate_file(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)

    required_columns = ["Date", "Region", "Sales"]

    missing = [col for col in required_columns if col not in df.columns]

    if missing:
        return {
            "status": "error",
            "message": f"Missing columns: {missing}"
        }

    return {
        "status": "success",
        "message": "Valid file ✅"
    }


# -------------------------------
# Analyze Data
# -------------------------------
@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)

    total_sales = df["Sales"].sum()
    avg_sales = df["Sales"].mean()

    region_sales = df.groupby("Region")["Sales"].sum().to_dict()

    return {
        "kpi": {
            "total_sales": float(total_sales),
            "average_sales": float(avg_sales)
        },
        "region_sales": region_sales
    }


# -------------------------------
# Generate Insights
# -------------------------------
@app.post("/insights")
async def generate_insights(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)

    insights = []

    total_sales = df["Sales"].sum()
    avg_sales = df["Sales"].mean()

    # Best & Worst region
    region_group = df.groupby("Region")["Sales"].sum()
    best_region = region_group.idxmax()
    worst_region = region_group.idxmin()

    # Rule-based insights
    if avg_sales < 5000:
        insights.append("⚠️ Overall sales are low. Consider increasing marketing efforts.")

    insights.append(f"🏆 Top performing region is {best_region}.")
    insights.append(f"📉 Lowest performing region is {worst_region}. Focus improvement here.")

    return {
        "total_sales": float(total_sales),
        "insights": insights
    }


# -------------------------------
# Full Analysis (All-in-One API)
# -------------------------------
@app.post("/full-analysis")
async def full_analysis(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)

    insights = []

    total_sales = df["Sales"].sum()
    avg_sales = df["Sales"].mean()

    region_group = df.groupby("Region")["Sales"].sum()
    region_sales = region_group.to_dict()

    best_region = region_group.idxmax()
    worst_region = region_group.idxmin()

    # Insights
    if avg_sales < 5000:
        insights.append("⚠️ Overall sales are below average.")

    ai_text = generate_ai_insight(total_sales, best_region, worst_region)

    insights.append(f"🏆 Best region: {best_region}")
    insights.append(f"📉 Needs attention: {worst_region}")
    insights.append(f"🤖 AI Insight: {ai_text}")

    return {
        "kpi": {
            "total_sales": float(total_sales),
            "average_sales": float(avg_sales)
        },
        "region_sales": region_sales,
        "insights": insights
    }
import requests

def generate_ai_insight(total_sales, best_region, worst_region):
    try:
        url = "https://openrouter.ai/api/v1/chat/completions"

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }

        data = {
            "model": "mistralai/mistral-7b-instruct",
            "messages": [
                {
                    "role": "user",
                    "content": f"""
                    You are a business consultant.

                    Total Sales: {total_sales}
                    Best Region: {best_region}
                    Worst Region: {worst_region}

                    Give a short professional business insight.
                    """
                }
            ]
        }

        response = requests.post(url, headers=headers, json=data)
        result = response.json()

        return result["choices"][0]["message"]["content"]

    except Exception as e:
        return f"""
        {best_region} is performing strongly, while {worst_region} needs improvement.
        Focus on targeted strategies to balance performance.
        """
    
models.Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# SIGN UP
from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str


# SIGN UP
@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    password = user.password

    # ✅ Validate password length
    if len(password) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password too long (max 72 characters)"
        )

    # ✅ Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    # ✅ Hash password
    hashed_password = pwd_context.hash(password)

    new_user = models.User(email=user.email, password=hashed_password)
    db.add(new_user)
    db.commit()

    return {"message": "User created successfully"}


# SIGN IN
@app.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    password = user.password

    # ✅ Validate password length
    if len(password) > 72:
        raise HTTPException(status_code=400, detail="Password too long")

    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")

    # ✅ Verify password (NO slicing)
    if not pwd_context.verify(password, db_user.password):
        raise HTTPException(status_code=400, detail="Incorrect password")

    return {"message": "Login successful"}

@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users
