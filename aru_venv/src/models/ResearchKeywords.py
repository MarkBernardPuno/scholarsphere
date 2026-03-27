from sqlalchemy import Column, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from models.Base import Base

class ResearchKeywords(Base):
    __tablename__ = 'researchkeywords'

    research_id = Column(BigInteger, ForeignKey('research.research_id'), primary_key=True)
    keywords_id = Column(BigInteger, ForeignKey('keywords.keywords_id'), primary_key=True)
    
    research = relationship("Research", back_populates="researchkeywords")
    keywords = relationship("Keywords", back_populates="researchkeywords")

    def __init__(self, research_id, keywords_id):
        self.research_id = research_id
        self.keywords_id = keywords_id