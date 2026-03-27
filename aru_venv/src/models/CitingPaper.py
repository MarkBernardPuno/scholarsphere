from sqlalchemy import Column, String, BigInteger, Date
from models.Base import Base

class CitingPaper(Base):
    __tablename__ = 'citingpaper'

    citing_id = Column(BigInteger, primary_key=True)
    research_indexing = Column(String(255), unique=True, nullable=False)
    pub_location = Column(String(255))
    citing_pub_date = Column(Date)
    cite_doi_or_full = Column(String(255))

    def __init__(self, research_indexing, pub_location, citing_pub_date, cite_doi_or_full=None):
        self.research_indexing = research_indexing
        self.pub_location = pub_location
        self.citing_pub_date = citing_pub_date
        self.cite_doi_or_full = cite_doi_or_full

    def __repr__(self):
        return f'<Research Indexing: {self.research_indexing}>'