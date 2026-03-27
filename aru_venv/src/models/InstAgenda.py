from sqlalchemy import Column, Text, BigInteger
from sqlalchemy.orm import relationship
from models.Base import Base


class InstAgenda(Base):
    __tablename__ = "instagenda"

    instagenda_id = Column(BigInteger, primary_key=True)
    instagenda_name = Column(Text, unique=True, nullable=False)

    researchinstagenda = relationship("ResearchInstAgenda", back_populates="instagenda")

    def __init__(self, instagenda_name):
        self.instagenda_name = instagenda_name

    def __repr__(self):
        return f"<InstAgenda: {self.instagenda_name}>"
