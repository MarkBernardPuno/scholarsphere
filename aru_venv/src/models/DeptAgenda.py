from sqlalchemy import Column, String, BigInteger, ForeignKey, Text
from sqlalchemy.orm import relationship
from models.Base import Base


class DeptAgenda(Base):
    __tablename__ = "deptagenda"

    deptagenda_id = Column(BigInteger, primary_key=True)
    deptagenda_name = Column(Text, unique=True, nullable=False)
    dept_id = Column(BigInteger, ForeignKey("departments.dept_id"), nullable=False)

    department = relationship("Departments", back_populates="deptagenda")
    researchdeptagenda = relationship("ResearchDeptAgenda", back_populates="deptagenda")

    def __init__(self, deptagenda_name, dept_id):
        self.deptagenda_name = deptagenda_name
        self.dept_id = dept_id

    def __repr__(self):
        return f"<DeptAgenda: {self.deptagenda_name}>"
