import os
import smtplib
from email.message import EmailMessage
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client, ClientOptions
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import google.generativeai as genai
from fpdf import FPDF
import json

# Import local config
import config

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable CORS for Next.js web application communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

URL: str = os.environ.get("SUPABASE_URL", "")
KEY: str = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY", "")

# 1. We keep a global client for unauthenticated routes (like signup)
global_supabase = None
if URL and KEY:
    try:
        global_supabase = create_client(URL, KEY)
    except Exception as e:
        print(f"⚠️ Failed to create global Supabase client: {e}")

security = HTTPBearer()

# 2. Refactored Dependency: Creates a fresh, authenticated client per request
def get_auth_client(token: HTTPAuthorizationCredentials = Depends(security)):
    if not URL or not KEY:
        raise HTTPException(
            status_code=500,
            detail="Backend Server Misconfigured: SUPABASE_URL or SUPABASE_ANON_KEY is missing from environment variables on hosting."
        )
    try:
        # Create a fresh client specifically for this request and inject the user's JWT into the headers
        # This guarantees RLS policies work without mutating global state!
        request_client = create_client(
            URL, 
            KEY, 
            options=ClientOptions(headers={"Authorization": f"Bearer {token.credentials}"})
        )
        
        # Verify the token is valid and fetch the user
        user_response = request_client.auth.get_user(token.credentials)
        if user_response is None or user_response.user is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
            
        # Return a dictionary containing both the configured client and the user
        return {"client": request_client, "user": user_response.user}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "Minutes.ai Python Backend Automation API",
        "version": "1.1.0"
    }


class UserCredentials(BaseModel):
    email: str
    password: str
    full_name: str

class LoginCredentials(BaseModel):
    email: str
    password: str

@app.post("/signup")
async def signup(credentials: UserCredentials):
    if not URL or not KEY or not global_supabase:
        raise HTTPException(
            status_code=500,
            detail="Supabase environment credentials (SUPABASE_URL / SUPABASE_ANON_KEY) are missing on backend hosting."
        )
    try:
        # We can safely use the global client here because we aren't setting a session
        response = global_supabase.auth.sign_up({
            "email": credentials.email,
            "password": credentials.password,
            "options": {
                "data": {
                    "full_name": credentials.full_name # Gets caught by the SQL trigger!
                }
            }
        })
        return {"message": "User and profile created successfully!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/my-profile")
async def get_profile(auth_data: dict = Depends(get_auth_client)):
    try:
        # 1. Unpack our per-request client and user from the dependency
        request_client = auth_data["client"]
        current_user = auth_data["user"]
        
        # 2. Query the database using the temporary, authenticated client
        response = request_client.table("profiles").select("*").eq("id", current_user.id).single().execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/login")
async def login(credentials: LoginCredentials):
    if not URL or not KEY:
        raise HTTPException(
            status_code=500,
            detail="Supabase environment credentials (SUPABASE_URL / SUPABASE_ANON_KEY) are missing on backend hosting."
        )
    try:
        # 1. Create a fresh, temporary client just for this login request
        # This prevents the logged-in session from polluting the global client state!
        login_client = create_client(URL, KEY)
        
        # 2. Authenticate the user with Supabase
        response = login_client.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        # 3. Return the JWT access token to the frontend
        return {
            "access_token": response.session.access_token,
            "token_type": "bearer",
            "user_id": response.user.id
        }
    except Exception as e:
        # Supabase will throw an error if the email/password is wrong
        raise HTTPException(status_code=401, detail="Invalid email or password")


class AutomateRequest(BaseModel):
    raw_text: str
    structure: Optional[str] = "standard"

@app.post("/automate")
def automate_notes(req: AutomateRequest):
    try:
        print("🤖 Processing notes with Gemini (JSON Mode)...")
        
        # Configure Gemini API
        api_key = getattr(config, "GEMINI_API_KEY", "")
        if not api_key or "YOUR_" in api_key or api_key == "":
            raise Exception("API key is missing or invalid.")
            
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        struct_pref = req.structure or "standard"
        
        prompt = f"""
        Act as an expert organizational Secretary General. Process the raw meeting notes and extract the information into a strict JSON format matching the structural rules below.

        FORMAT STRUCTURE PREFERENCE: {struct_pref.upper()}

        CRITICAL STRUCTURAL RULES FOR THE CHOSEN FORMAT:
        - If STANDARD: Write a balanced 2-3 sentence overview paragraph. Keep decisions precise.
        - If DETAILED: Write a highly granular, thorough overview log including sub-points or contextual arguments mentioned. Provide highly descriptive tasks.
        - If CONCISE: Reduce text to a 1-sentence outcome summary and minimal word count bullets.

        You MUST return ONLY a valid JSON object with exactly these keys:
        - "overview": A string (tailor depth and length strictly to the format preference above).
        - "decisions": An array of strings.
        - "actions": An array of objects with keys: "task", "lead", "status", "due".
          CRITICAL: In the "due" field, if a due date is specified in the notes without a year (e.g., "March 31" or "April 1"), assume the year is 2026. Do NOT use 2024 or other years.

        Raw Notes to Process:
        {req.raw_text}
        """
        
        # Call Gemini and enforce JSON output
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        
        # Convert Gemini's text response into a Python dictionary
        structured_data = json.loads(response.text)
        
        # Return the clean JSON object directly to the frontend
        return structured_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Automation failed: {str(e)}")

class ActionItem(BaseModel):
    task: str
    lead: str
    status: str
    due: str

class MomContentModel(BaseModel):
    overview: str
    decisions: list[str]
    actions: list[ActionItem]

class SendEmailRequest(BaseModel):
    summary_text: str
    file_name: str
    emails: list[str]
    mom_content: Optional[MomContentModel] = None


@app.post("/send-email")
def send_email_endpoint(req: SendEmailRequest, auth_data: dict = Depends(get_auth_client)):
    # 1. Create a safe PDF locally in the workspace
    pdf_filename = f"{req.file_name.replace(' ', '_')}_Minutes.pdf"
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_margins(15, 15, 15)
        
        # 1. Document Title / Brand Header
        pdf.set_text_color(80, 45, 85) # Brand Purple (#502D55)
        pdf.set_font("helvetica", style="B", size=20)
        pdf.cell(0, 15, text=req.file_name, ln=True, align="L")
        
        # Decorative divider line
        pdf.set_draw_color(80, 45, 85)
        pdf.set_line_width(0.5)
        pdf.line(15, 30, 195, 30)
        pdf.ln(8)
        
        if req.mom_content:
            # RENDER THE NEW LUXURIOUS HIGH-FIDELITY AUTOMATED MOM STRUCTURE!
            mom = req.mom_content
            
            # --- Section 1: Overview & Objectives ---
            pdf.set_font("helvetica", style="B", size=12)
            pdf.cell(0, 8, text="1. Overview & Objectives", ln=True)
            pdf.ln(2)
            
            pdf.set_font("helvetica", size=10)
            pdf.set_text_color(80, 45, 85) # Deep Purple text
            safe_overview = mom.overview.encode('latin-1', 'replace').decode('latin-1')
            pdf.multi_cell(0, 6, text=safe_overview)
            pdf.ln(6)
            
            # --- Section 2: Key Decisions Made ---
            pdf.set_text_color(80, 45, 85)
            pdf.set_font("helvetica", style="B", size=12)
            pdf.cell(0, 8, text="2. Key Decisions Made", ln=True)
            pdf.ln(2)
            
            pdf.set_font("helvetica", size=10)
            pdf.set_text_color(80, 45, 85)
            if not mom.decisions:
                pdf.set_font("helvetica", style="I", size=10)
                pdf.cell(0, 6, text="No decisions logged.", ln=True)
            else:
                for dec in mom.decisions:
                    safe_dec = dec.encode('latin-1', 'replace').decode('latin-1')
                    pdf.set_x(20)
                    pdf.cell(5, 6, text="-", ln=False)
                    pdf.multi_cell(0, 6, text=safe_dec)
            pdf.ln(6)
            
            # --- Section 3: Action Items & Timeline ---
            pdf.set_text_color(80, 45, 85)
            pdf.set_font("helvetica", style="B", size=12)
            pdf.cell(0, 8, text="3. Action Items & Timeline", ln=True)
            pdf.ln(3)
            
            if not mom.actions:
                pdf.set_font("helvetica", style="I", size=10)
                pdf.cell(0, 6, text="No action items defined.", ln=True)
            else:
                # Table Headers Setup
                pdf.set_font("helvetica", style="B", size=9)
                pdf.set_text_color(255, 255, 255) # White text
                pdf.set_fill_color(80, 45, 85) # Purple fill
                
                col_widths = [90, 30, 30, 30]
                headers = ["Action Item / Task", "Assigned Lead", "Status", "Due Date"]
                
                for i, header in enumerate(headers):
                    pdf.cell(col_widths[i], 8, text=header, border=1, ln=False, align="C", fill=True)
                pdf.ln(8)
                
                # Table Rows Setup
                pdf.set_font("helvetica", size=9)
                for act in mom.actions:
                    safe_task = act.task.encode('latin-1', 'replace').decode('latin-1')
                    safe_lead = act.lead.encode('latin-1', 'replace').decode('latin-1')
                    safe_status = act.status.encode('latin-1', 'replace').decode('latin-1')
                    safe_due = act.due.encode('latin-1', 'replace').decode('latin-1')
                    
                    pdf.set_fill_color(250, 246, 242) # Cream background (#FAF6F2)
                    pdf.set_text_color(80, 45, 85) # Purple text
                    
                    pdf.cell(col_widths[0], 8, text=safe_task[:50], border=1, ln=False, fill=True)
                    pdf.cell(col_widths[1], 8, text=safe_lead[:18], border=1, ln=False, align="C", fill=True)
                    pdf.cell(col_widths[2], 8, text=safe_status[:15], border=1, ln=False, align="C", fill=True)
                    pdf.cell(col_widths[3], 8, text=safe_due[:15], border=1, ln=True, align="C", fill=True)
        else:
            # Fallback to plain text PDF if mom_content is not supplied
            pdf.set_font("helvetica", size=11)
            pdf.cell(0, 10, text="Minutes of Meeting", ln=True, align="C")
            pdf.ln(5)
            
            pdf.set_font("helvetica", style="B", size=12)
            pdf.cell(0, 10, text=f"Subject: {req.file_name}", ln=True)
            pdf.ln(5)
            
            pdf.set_font("helvetica", size=11)
            safe_text = req.summary_text.encode('latin-1', 'replace').decode('latin-1')
            pdf.multi_cell(0, 6, text=safe_text)
            
        pdf.output(pdf_filename)
    except Exception as pdf_err:
        print(f"❌ Failed to construct PDF: {pdf_err}")
        pdf_filename = None

    # 2. Setup standard dynamic SMTP credentials (defaulting to central Gmail credentials from config.py)
    smtp_host = "smtp.gmail.com"
    smtp_port = 465
    smtp_username = getattr(config, "SENDER_EMAIL", "")
    smtp_password = getattr(config, "APP_PASSWORD", "")
    
    if auth_data and "user" in auth_data:
        user = auth_data["user"]
        meta = getattr(user, "user_metadata", {}) or {}
        user_host = meta.get("smtp_host")
        if user_host and user_host != "resend":
            smtp_host = user_host
            smtp_port_val = meta.get("smtp_port")
            if smtp_port_val:
                try:
                    smtp_port = int(smtp_port_val)
                except ValueError:
                    smtp_port = 465
            smtp_username = meta.get("smtp_username") or smtp_username
            smtp_password = meta.get("smtp_password") or smtp_password
    
    # Represent the active logged-in user dynamically in headers
    logged_in_email = auth_data["user"].email if (auth_data and "user" in auth_data) else smtp_username
    
    if not smtp_username or "YOUR_" in smtp_username or not smtp_password or "YOUR_" in smtp_password:
        print("⚠️ SMTP SENDER_EMAIL or App Password not configured. Saved PDF locally instead!")
        return {
            "success": True,
            "message": "Saved PDF document locally in workspace directory! (Email was not sent because credentials are not configured yet.)",
            "pdf_path": pdf_filename
        }

    try:
        # Send using standard SMTP
        msg = EmailMessage()
        msg['Subject'] = f"📝 Meeting Summary & Action Items: {req.file_name}"
        msg['From'] = f"{logged_in_email} <{smtp_username}>"
        msg['Reply-To'] = logged_in_email
        msg['To'] = ", ".join(req.emails)
        msg.set_content(f"Hello Team,\n\nPlease find the automated summary and action items of our meeting below. The official PDF document is also attached for your records.\n\n---\n\n{req.summary_text}")

        # Attach the generated PDF
        if pdf_filename and os.path.exists(pdf_filename):
            with open(pdf_filename, 'rb') as f:
                pdf_data = f.read()
            msg.add_attachment(
                pdf_data, 
                maintype='application', 
                subtype='pdf', 
                filename=os.path.basename(pdf_filename)
            )

        # Connect to dynamic SMTP server with SSL or STARTTLS support (timeout to prevent hanging)
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=15) as smtp:
                smtp.login(smtp_username, smtp_password)
                smtp.send_message(msg)
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as smtp:
                smtp.starttls()
                smtp.login(smtp_username, smtp_password)
                smtp.send_message(msg)
        
        print("✅ Success! Dynamic SMTP emails sent to recipients.")
        
        return {
            "success": True,
            "message": f"Successfully distributed Meeting Minutes to {len(req.emails)} recipients!",
            "pdf_path": pdf_filename
        }
    except Exception as err:
        print(f"❌ Failed to send email: {err}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send email: {str(err)}. PDF document has been successfully saved locally."
        )