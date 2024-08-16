from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Annotated, Optional
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

# FastAPI application instance
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables based on the models
models.Base.metadata.create_all(bind=engine)

# Pydantic model for user input
class UserCreate(BaseModel):
    username: str
    userpassword: str
    usercontext: Optional[str] = None
    userstatus: Optional[str] = 'null'

class UserOut(BaseModel):
    user_id: int
    username: str
    usercontext: Optional[str] = None
    userstatus: Optional[str] = None

    class Config:
        orm_mode = True

# Dependency for database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@app.get("/")
async def root():
    return {"message": "Welcome to the FastAPI application!"}


# Create a new user
@app.post("/users/", response_model=UserOut)
async def create_user(user: UserCreate, db: db_dependency):
    db_user = models.User(
        username=user.username,
        userpassword=user.userpassword,
        usercontext=user.usercontext,
        userstatus=user.userstatus
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Get user by ID
@app.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: int, db: db_dependency):
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


# Get all users

# Update user status
@app.put("/users/{user_id}", response_model=UserOut)
async def update_user(user_id: int, user: UserCreate, db: db_dependency):
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.username = user.username
    db_user.userpassword = user.userpassword
    db_user.usercontext = user.usercontext
    db_user.userstatus = user.userstatus

    db.commit()
    db.refresh(db_user)
    return db_user

# Delete a user by ID
@app.delete("/users/{user_id}")
async def delete_user(user_id: int, db: db_dependency):
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return {"detail": "User deleted successfully"}
