from sqlalchemy import Column, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from models.Base import Base

class ResearchInstAgenda(Base):
    __tablename__ = 'researchinstagenda'

    research_id = Column(BigInteger, ForeignKey('research.research_id'), primary_key=True)
    instagenda_id = Column(BigInteger, ForeignKey('instagenda.instagenda_id'), primary_key=True)
    
    research = relationship("Research", back_populates="researchinstagenda")
    instagenda = relationship("InstAgenda", back_populates="researchinstagenda")

    def __init__(self, research_id, instagenda_id):
        self.research_id = research_id
        self.instagenda_id = instagenda_id