from sqlalchemy import Boolean,Column,ForeignKey,Integer,String,Text
from database import Base

class User(Base):
    __tablename__ = 'list'

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)   # Kullanıcı adı (benzersiz ve boş olamaz)
    userpassword = Column(String, nullable=False)            # Kullanıcı şifresi (boş olamaz)
    usercontext = Column(Text, nullable=True)                # Kullanıcı bağlamı (isteğe bağlı, büyük metin alanı)
    userstatus = Column(String, default='null')     
   

