from sqlalchemy import Column, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from models.Base import Base

class AuthorResearch(Base):
    __tablename__ = 'authorresearch'

    research_id = Column(BigInteger, ForeignKey('research.research_id'), primary_key=True)
    author_id = Column(BigInteger, ForeignKey('author.author_id'), primary_key=True)
    
    research = relationship("Research", back_populates="authorresearch")
    author = relationship("Author", back_populates="authorresearch")

    def __init__(self, research_id, author_id):
        self.research_id = research_id
        self.author_id = author_id