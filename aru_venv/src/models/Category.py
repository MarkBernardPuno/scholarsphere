from sqlalchemy import Column, String, BigInteger
from sqlalchemy.orm import relationship
from models.Base import Base

class Category(Base):
    __tablename__ = 'category'

    category_id = Column(BigInteger, primary_key=True)
    category_description = Column(String(255), unique=True, nullable=False)
    
    incentivesapplication = relationship("IncentivesApplication", back_populates="category")

    def __init__(self, category_description):
        self.category_description = category_description
        
    def __repr__(self):
        return f'<Category: {self.category_description}>'