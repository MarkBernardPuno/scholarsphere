from sqlalchemy import Column, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from models.Base import Base

class StudentResearch(Base):
    __tablename__ = 'studentresearch'

    research_id = Column(BigInteger, ForeignKey('research.research_id'), primary_key=True)
    student_id = Column(BigInteger, ForeignKey('student.student_id'), primary_key=True)
    
    research = relationship("Research", back_populates="studentresearch")
    student = relationship("Student", back_populates="studentresearch")

    def __init__(self, research_id, student_id):
        self.research_id = research_id
        self.student_id = student_id