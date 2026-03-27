from sqlalchemy import Column, String, BigInteger
from sqlalchemy.orm import relationship
from models.Base import Base

class Keywords(Base):
    __tablename__ = 'keywords'

    keywords_id = Column(BigInteger, primary_key=True)
    keywords_name = Column(String(255), unique=True, nullable=False)
    
    researchkeywords = relationship("ResearchKeywords", back_populates="keywords")

    def __init__(self, keywords_name):
        self.keywords_name = keywords_name

    def __repr__(self):
        return f'<Keywords: {self.keywords_name}>'
