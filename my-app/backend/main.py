import logging
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models import User, Market_List
from typing import List



# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# JWT Configuration
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Security
security = HTTPBearer()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# User models
class UserCreate(BaseModel):
    username: str
    userpassword: str

class UserLogin(BaseModel):
    username: str
    userpassword: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class MarketListCreate(BaseModel):
    item_name: str
    item_status: str
    user_id: int  # Include user_id in the request body

class MarketListUpdate(BaseModel):
    item_status: str

class MarketListResponse(BaseModel):
    item_id: int
    item_name: str
    item_status: str
    

    class Config:
        orm_mode = True

# Middleware function for token validation
async def token_validation(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        request.state.user_id = user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Password Hashing Functions
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Token Creation Function
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Register User Endpoint
@app.post("/register/")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if the user already exists
        db_user = db.query(User).filter(User.username == user.username).first()
        if db_user:
            logging.info(f"User '{user.username}' already registered, using existing user_id: {db_user.user_id}")
            return {"message": "User already registered", "user_id": db_user.user_id}
        
        # If user does not exist, create a new user
        hashed_password = get_password_hash(user.userpassword)
        new_user = User(username=user.username, userpassword=hashed_password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        logging.info(f"User '{user.username}' registered successfully with user_id: {new_user.user_id}")
        return {"message": "User registered successfully", "user_id": new_user.user_id}
    
    except HTTPException as http_ex:
        raise http_ex
    
    except Exception as e:
        logging.error(f"Internal Server Error during registration: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error during registration")


# Login User Endpoint
@app.post("/login/")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    logging.debug(f"Attempting to login user: {user.username}")
    
    try:
        # Fetch user from the database
        logging.debug("Querying database for user...")
        db_user = db.query(User).filter(User.username == user.username).first()
        
        if not db_user:
            logging.warning(f"Invalid username '{user.username}'.")
            raise HTTPException(status_code=400, detail="Invalid username or password")
        
        # Verify password
        logging.debug("Verifying password...")
        if not verify_password(user.userpassword, db_user.userpassword):
            logging.warning(f"Invalid password for username '{user.username}'.")
            raise HTTPException(status_code=400, detail="Invalid username or password")
        
        # Create access token
        logging.debug("Creating access token...")
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username, "user_id": db_user.user_id}, expires_delta=access_token_expires
        )
        
        logging.info(f"User '{user.username}' logged in successfully.")
        return {"access_token": access_token, "token_type": "bearer"}
    
    except HTTPException as http_exc:
        logging.error(f"HTTPException during login: {http_exc.detail}")
        raise http_exc  # Re-raise HTTP exceptions to propagate them as is
    
    except Exception as e:
        logging.error(f"Unexpected error during login for user '{user.username}': {e}")
        logging.error(traceback.format_exc())  # Log the full traceback for debugging
        raise HTTPException(status_code=500, detail="Internal Server Error during login")
    logging.debug(f"Attempting to login user: {user.username}")
    
    try:
        # Fetch user from database
        db_user = db.query(User).filter(User.username == user.username).first()
        if not db_user:
            logging.warning(f"Invalid username '{user.username}'.")
            raise HTTPException(status_code=400, detail="Invalid username or password")
        
        # Verify password
        if not verify_password(user.userpassword, db_user.userpassword):
            logging.warning(f"Invalid password for username '{user.username}'.")
            raise HTTPException(status_code=400, detail="Invalid username or password")
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username, "user_id": db_user.user_id}, expires_delta=access_token_expires
        )
        
        logging.info(f"User '{user.username}' logged in successfully.")
        return {"access_token": access_token, "token_type": "bearer"}
    
    except HTTPException as http_exc:
        raise http_exc  # Re-raise HTTP exceptions to propagate them as is
    
    except Exception as e:
        logging.error(f"Error during login for user '{user.username}': {e}")
        logging.error(traceback.format_exc())  # Log the full traceback for debugging
        raise HTTPException(status_code=500, detail="Internal Server Error during login")

# Market List Endpoints
@app.post("/list/", response_model=MarketListResponse)
def create_item(item: MarketListCreate, db: Session = Depends(get_db)):
    try:
        # Ensure user_id is valid
        if item.user_id <= 0:
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        logging.info(f"Creating item with data: {item}")

        # Check if the item already exists for the user
        db_item = db.query(Market_List).filter(
            Market_List.item_name == item.item_name,
         
        ).first()

        if db_item:
            raise HTTPException(status_code=400, detail="Item already exists for this user.")

        # Create new item
        new_item = Market_List(
            item_name=item.item_name,
            item_status=item.item_status,
            
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)  # This will refresh the instance and return the generated item_id

        logging.info(f"Item created successfully: {new_item}")
        return new_item
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(f"Error during item creation: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/list/", response_model=List[MarketListResponse])
def get_market_list_items(db: Session = Depends(get_db)):
    try:
        logging.info("Fetching market list items...")

        # SQL sorgusunu loglayarak kontrol edin
        query = db.query(Market_List)
        logging.info(f"Generated SQL Query: {str(query.statement)}")

        # Tüm market list item'lerini getir
        items = query.all()

        # Sorgu sonucu boş olsa bile 200 döndür
        logging.info(f"Fetched items: {items}")
        return items  # Boş liste döndürülebilir
    
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
    @app.put("/list/{item_id}")
    def update_market_list_status(item_id: int, item_data: MarketListUpdate, db: Session = Depends(get_db)):
    # item_id'ye göre item'ı bul
    item = db.query(Market_List).filter(Market_List.item_id == item_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Sadece item_status'u güncelle
    item.item_status = item_data.item_status

    db.commit()  # Değişiklikleri veritabanına kaydet
    db.refresh(item)  # Güncellenmiş item'i al

    return {"message": "Item status updated successfully", "item": item}







@app.delete("/list/{item_id}", response_model=MarketListResponse)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    try:
        logging.info(f"Attempting to delete item with ID: {item_id}")

        # Fetch the item by item_id
        db_item = db.query(Market_List).filter(Market_List.item_id == item_id).first()

        # If item is not found, raise 404 error
        if not db_item:
            logging.warning(f"Item with ID {item_id} not found.")
            raise HTTPException(status_code=404, detail=f"Item with ID {item_id} not found.")

        # Log the item to be deleted for debugging
        logging.info(f"Item found: {db_item}")

        # Delete the item
        db.delete(db_item)
        db.commit()

        logging.info(f"Item with ID {item_id} deleted successfully.")
        return db_item

    except HTTPException as e:
        logging.error(f"HTTP error: {e.detail}")
        raise e  # Re-raise the HTTP error to return it to the client

    except Exception as e:
        logging.error(f"Unexpected error during deletion: {e}", exc_info=True)
        # Rollback in case of error to prevent transaction issues
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal Server Error")

