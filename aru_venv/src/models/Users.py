from models.Base import Base
from sqlalchemy import BigInteger, Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class Users(Base):
    __tablename__ = "users"

    user_id = Column(BigInteger, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255))
    role = Column(String(255), nullable=False)
    dept_id = Column(Integer, ForeignKey("departments.dept_id"), nullable=False)
    camp_id = Column(Integer, ForeignKey("campus.camp_id"), nullable=True)
    activated = Column(Boolean, nullable=False)
    image = Column(String, nullable=True)

    author = relationship("Author", back_populates="user")
    research = relationship("Research", back_populates="user")
    department = relationship("Departments", back_populates="users")
    campus = relationship("Campus", back_populates="users")
    incentivesevaluation = relationship("IncentivesEvaluation", back_populates="user")
    incentivesapplication = relationship("IncentivesApplication", back_populates="user")

    def __init__(
        self,
        email,
        dept_id,
        camp_id,
        role="researcher",
        activated=False,
        password=None,
        image=None,
    ):
        self.email = email
        self.password = password
        self.role = role
        self.dept_id = dept_id
        self.camp_id = camp_id
        self.activated = activated
        self.image = image

    def __repr__(self):
        return f"<User(email='{self.email}', role='{self.role}', dept_id={self.dept_id}, camp_id={self.camp_id})>"

    def as_dict(self):
        return {
            "user_id": self.user_id,
            "email": self.email,
            "role": self.role,
            "dept_id": self.dept_id,
            "camp_id": self.camp_id,
            "image": self.image,
        }
