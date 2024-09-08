from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = 'users'
    
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    userpassword = Column(String)
    
    # Establish relationship with Market_List
  

class Market_List(Base):
    __tablename__ = 'market_list'
    
    item_id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, index=True)
    item_status = Column(String)
  
    
