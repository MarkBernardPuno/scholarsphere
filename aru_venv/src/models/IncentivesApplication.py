from sqlalchemy import Column, String, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from models.Base import Base

class IncentivesApplication(Base):
    __tablename__ = 'incentivesapplication'

    application_id = Column(BigInteger, primary_key=True)
    research_id = Column(BigInteger, ForeignKey('research.research_id'))
    user_id = Column(BigInteger, ForeignKey('users.user_id'))
    status_id = Column(BigInteger, ForeignKey('status.status_id'))
    date_submitted = Column(String(255), nullable=False)
    category_id = Column(BigInteger, ForeignKey('category.category_id'))
    
    research = relationship("Research", back_populates="incentivesapplication")
    user = relationship("Users", back_populates="incentivesapplication")
    status = relationship("Status", back_populates="incentivesapplication")
    category = relationship("Category", back_populates="incentivesapplication")

    def __init__(self, research_id, user_id, status_id, date_submitted, category_id):
        self.research_id = research_id
        self.user_id = user_id
        self.status_id = status_id
        self.date_submitted = date_submitted
        self.category_id = category_id
        
    def __repr__(self):
        return f'<Incentives Application: {self.date_submitted} (status_id: {self.status_id})>'