from sqlalchemy import Column, String, BigInteger, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from models.Base import Base


class Author(Base):
    __tablename__ = "author"

    author_id = Column(BigInteger, primary_key=True)
    author_name = Column(String(255), nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.user_id"), nullable=True)
    
    user = relationship("Users", back_populates="author")
    authorresearch = relationship("AuthorResearch", back_populates="author")

    def __init__(self, author_name, user_id=None):
        self.author_name = author_name
        self.user_id = user_id

    def __repr__(self):
        return f"<Author: {self.author_name} (user_id: {self.user_id})>"

    def as_dict(self):
        return {
            "author_id": self.author_id,
            "author_name": self.author_name,
            "user_id": self.user_id,
        }
