from sqlalchemy import Column, String, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from models.Base import Base


class Student(Base):
    __tablename__ = "student"

    student_id = Column(BigInteger, primary_key=True)
    student_name = Column(String(255), nullable=False)
    dept_id = Column(BigInteger, ForeignKey("departments.dept_id"), nullable=True)
    
    department = relationship("Departments", back_populates="student")
    studentresearch = relationship("StudentResearch", back_populates="student")

    def __init__(self, student_name, dept_id=None):
        self.student_name = student_name
        self.dept_id = dept_id

    def __repr__(self):
        return f"<Author: {self.student_name} (dept_id: {self.dept_id})>"

    def as_dict(self):
        return {
            "student_id": self.student_id,
            "student_name": self.student_name,
            "dept_id": self.dept_id,
        }
