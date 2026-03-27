from sqlalchemy import Column, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from models.Base import Base

class ResearchDepartment(Base):
    __tablename__ = 'researchdepartment'

    research_id = Column(BigInteger, ForeignKey('research.research_id'), primary_key=True)
    dept_id = Column(BigInteger, ForeignKey('departments.dept_id'), primary_key=True)
    
    research = relationship("Research", back_populates="researchdepartment")
    department = relationship("Departments", back_populates="researchdepartment")

    def __init__(self, research_id, dept_id):
        self.research_id = research_id
        self.dept_id = dept_id