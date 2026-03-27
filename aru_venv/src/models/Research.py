from sqlalchemy import Column, Text, BigInteger, Date, ForeignKey
from sqlalchemy.orm import relationship
from models.Base import Base


class Research(Base):
    __tablename__ = "research"

    research_id = Column(BigInteger, primary_key=True)
    title = Column(Text, unique=True, nullable=False)
    abstract = Column(Text, nullable=True)
    presented_where = Column(Text, nullable=True)
    presentation_location = Column(Text)
    presentation_date = Column(Date)
    published_where = Column(Text)
    publication_date = Column(Date)
    cited_where = Column(Text)
    cited_date = Column(Date)
    doi_or_full = Column(Text)
    camp_id = Column(BigInteger, ForeignKey('campus.camp_id'))
    user_id = Column(BigInteger, ForeignKey('users.user_id'))
    
    user = relationship("Users", back_populates="research")
    files = relationship("File", back_populates="research")
    campus = relationship("Campus", back_populates="research")
    authorresearch = relationship("AuthorResearch", back_populates="research")
    studentresearch = relationship("StudentResearch", back_populates="research")
    researchkeywords = relationship("ResearchKeywords", back_populates="research")
    researchdepartment = relationship("ResearchDepartment", back_populates="research")
    researchdeptagenda = relationship("ResearchDeptAgenda", back_populates="research")
    researchinstagenda = relationship("ResearchInstAgenda", back_populates="research")
    incentivesevaluation = relationship("IncentivesEvaluation", back_populates="research")
    incentivesapplication = relationship("IncentivesApplication", back_populates="research")

    def __init__(self, title, abstract, camp_id, user_id, presented_where=None, presentation_location=None, presentation_date=None, 
                 published_where=None, publication_date=None, cited_where=None, cited_date=None,  doi_or_full=None):
        self.title = title
        self.abstract = abstract
        self.presented_where = presented_where
        self.presentation_location = presentation_location
        self.presentation_date = presentation_date
        self.published_where = published_where
        self.publication_date = publication_date
        self.cited_where = cited_where
        self.cited_date = cited_date
        self.doi_or_full = doi_or_full
        self.camp_id = camp_id
        self.user_id = user_id
        
    def __repr__(self):
        return f'<Research: {self.title}>'
    
    def as_dict(self):
        return {
            'research_id': self.research_id,
            'title': self.title,
            'abstract': self.abstract,
            'presented_where': self.presented_where,
            'presentation_location': self.presentation_location,
            'presentation_date': self.presentation_date,
            'published_where': self.published_where,
            'publication_date': self.publication_date,
            'cited_where': self.cited_where,
            'cited_date': self.cited_date,
            'doi_or_full': self.doi_or_full,
            'camp_id': self.camp_id,
            'user_id': self.user_id,
            'authors': [author.as_dict() for author in self.authorresearch],
            'students': [student.as_dict() for student in self.studentresearch],
            'keywords': [keyword.as_dict() for keyword in self.researchkeywords],
            'department': [department.as_dict() for department in self.researchdepartment],
            'deptagenda': [deptagenda.as_dict() for deptagenda in self.researchdeptagenda],
            'instagenda': [instagenda.as_dict() for instagenda in self.researchinstagenda],
        }