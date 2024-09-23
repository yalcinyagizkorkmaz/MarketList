from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = 'users'
    
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    userpassword = Column(String)
    
    # Establish a relationship with Market_List
    market_list_items = relationship("Market_List", back_populates="owner")

class Market_List(Base):
    __tablename__ = 'market_list'
    
    item_id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, index=True)
    item_status = Column(String)
    user_id = Column(Integer, ForeignKey('users.user_id'))

    # Establish the relationship with User
    owner = relationship("User", back_populates="market_list_items")
