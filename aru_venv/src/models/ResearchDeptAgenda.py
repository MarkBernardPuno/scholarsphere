from sqlalchemy import Column, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from models.Base import Base

class ResearchDeptAgenda(Base):
    __tablename__ = 'researchdeptagenda'

    research_id = Column(BigInteger, ForeignKey('research.research_id'), primary_key=True)
    deptagenda_id = Column(BigInteger, ForeignKey('deptagenda.deptagenda_id'), primary_key=True)
    
    research = relationship("Research", back_populates="researchdeptagenda")
    deptagenda = relationship("DeptAgenda", back_populates="researchdeptagenda")

    def __init__(self, research_id, deptagenda_id):
        self.research_id = research_id
        self.deptagenda_id = deptagenda_id