from sqlalchemy import Column, BigInteger, ForeignKey
from models.Base import Base

class Researchciting(Base):
    __tablename__ = 'researchciting'

    research_id = Column(BigInteger, ForeignKey('research.research_id'), primary_key=True)
    citing_id = Column(BigInteger, ForeignKey('citingpaper.citing_id'), primary_key=True)

    def __init__(self, research_id, citing_id):
        self.research_id = research_id
        self.citing_id = citing_id