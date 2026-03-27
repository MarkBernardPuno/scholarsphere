from sqlalchemy import Column, String, BigInteger
from sqlalchemy.orm import relationship
from models.Base import Base

class Status(Base):
    __tablename__ = 'status'

    status_id = Column(BigInteger, primary_key=True)
    status_desc = Column(String(255))
    
    incentivesevaluation = relationship("IncentivesEvaluation", back_populates="status")
    incentivesapplication = relationship("IncentivesApplication", back_populates="status")

    def __init__(self, status_desc):
        self.status_desc = status_desc
        
    def __repr__(self):
        return f'<Status: {self.status_desc}>'