from sqlalchemy import Column, String, BigInteger
from sqlalchemy.orm import relationship
from models.Base import Base

class Campus(Base):
    __tablename__ = 'campus'

    camp_id = Column(BigInteger, primary_key=True)
    camp_name = Column(String(255), unique=True, nullable=False)
    
    users = relationship("Users", back_populates="campus")
    research = relationship("Research", back_populates="campus")

    def __init__(self, camp_name):
        self.camp_name = camp_name

    def __repr__(self):
        return f'<Campus: {self.camp_name}>'