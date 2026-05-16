# backend/app/services/firebase_auth.py
import os
import json
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

# 1. Force load environment variables immediately
load_dotenv()

security = HTTPBearer()

def initialize_firebase():
    """
    Called by main.py to start the Firebase Admin SDK.
    """
    if not firebase_admin._apps:
        # 1. Check for the raw JSON string in environment variables (Render/Production)
        firebase_json_str = os.getenv("FIREBASE_JSON")
        
        if firebase_json_str:
            try:
                print("--- Attempting to initialize Firebase via FIREBASE_JSON env var ---")
                # Parse the stringified JSON into a dictionary
                cert_dict = json.loads(firebase_json_str)
                cred = credentials.Certificate(cert_dict)
                firebase_admin.initialize_app(cred)
                print("--- SUCCESS: Firebase initialized via JSON string ---")
                return
            except Exception as e:
                print(f"--- ERROR parsing FIREBASE_JSON: {str(e)} ---")
        
        # 2. Fallback to physical file (Local Development)
        print("--- Falling back to physical credentials file ---")
        cred_filename = os.getenv("FIREBASE_CREDENTIALS", "service-account.json") 
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        cred_path = os.path.join(base_dir, cred_filename)

        if os.path.exists(cred_path):
            try:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                print(f"--- SUCCESS: Initializing Firebase with {cred_path} ---")
            except Exception as e:
                print(f"--- ERROR initializing from file: {str(e)} ---")
        else:
            print(f"--- FATAL ERROR: Service account file NOT FOUND at {cred_path} AND no valid FIREBASE_JSON env var provided ---")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    This is the function your endpoints.py is trying to import.
    """
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"--- AUTH FAILED: {str(e)} ---")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
        )