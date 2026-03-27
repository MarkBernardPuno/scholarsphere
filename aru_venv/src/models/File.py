from sqlalchemy import Column, String, BigInteger, ForeignKey, Text
from sqlalchemy.orm import relationship
from models.Base import Base


class File(Base):
    __tablename__ = "file"

    file_id = Column(BigInteger, primary_key=True)
    research_id = Column(BigInteger, ForeignKey("research.research_id"))
    category_id = Column(BigInteger, ForeignKey("category.category_id"))
    file_type = Column(Text, nullable=False)
    file_path = Column(Text, unique=True, nullable=False)

    research = relationship("Research", back_populates="files")

    def __init__(self, research_id, category_id, file_type, file_path):
        self.research_id = research_id
        self.category_id = category_id
        self.file_type = file_type
        self.file_path = file_path

    def __repr__(self):
        return f"<File Type: {self.file_type}>"
