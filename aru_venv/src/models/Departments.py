from sqlalchemy import Column, String, BigInteger
from sqlalchemy.orm import relationship
from models.Base import Base

class Departments(Base):
    __tablename__ = 'departments'

    dept_id = Column(BigInteger, primary_key=True)
    dept_name = Column(String(255), nullable=False)
    
    users = relationship("Users", back_populates="department")
    student = relationship("Student", back_populates="department")
    deptagenda = relationship("DeptAgenda", back_populates="department")
    researchdepartment = relationship("ResearchDepartment", back_populates="department")

    def __init__(self, dept_name):
        self.dept_name = dept_name

    def __repr__(self):
        return f'<Departments: {self.dept_name}>'
    
    def as_dict(self):
        return {
            'dept_id': self.dept_id,
            'dept_name': self.dept_name,
        }