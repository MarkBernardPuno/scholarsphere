from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, backref, relationship
from sqlalchemy import Column, Integer, String, BigInteger, Boolean, Date, ForeignKey 

# Create the SQLAlchemy engine
engine = create_engine('postgresql://postgres:1234@localhost/aru_research_db')

# Create a base class for all our models
Base = declarative_base()
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Departments(Base):
    __tablename__ = 'departments'

    dept_id = Column(BigInteger, primary_key=True)
    dept_name = Column(String(255), unique=True, nullable=False)

    def __init__(self, dept_name):
        self.dept_name = dept_name

    def __repr__(self):
        return f'<Departments: {self.dept_name}>'


class Users(Base):
    __tablename__ = 'users'

    user_id = Column(BigInteger, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255))
    role = Column(String(255), nullable=False)
    dept_id = Column(Integer, ForeignKey('departments.dept_id'), nullable=False)
    activated = Column(Boolean, nullable=False)
    department = relationship('Departments', backref=backref('users', lazy=True))
    
    def __init__(self, email, dept_id, role='researcher', activated=False, password=None):
        self.email = email
        self.password = password
        self.role = role
        self.dept_id = dept_id
        self.activated = activated
        
    def __repr__(self):
        return {"email":self.email}
    
    def as_dict(self):
       return {
           "user_id":self.user_id,
           "email":self.email,
           "role":self.role,
           "dept_id":self.dept_id,
        }


class Author(Base):
    __tablename__ = 'author'

    author_id = Column(BigInteger, primary_key=True)
    author_name = Column(String(255), unique=True, nullable=False)
    user_id = Column(BigInteger, ForeignKey('users.user_id'), nullable=True)

    def __init__(self, author_name, user_id=None):
        self.author_name = author_name
        self.user_id = user_id

    def __repr__(self):
        return f'<Author: {self.author_name} (user_id: {self.user_id})>'
    
    def as_dict(self):
        return {
            "author_id":self.author_id,
            "author_name":self.author_name,
            "user_id":self.user_id
        }


class Category(Base):
    __tablename__ = 'category'

    category_id = Column(BigInteger, primary_key=True)
    category_description = Column(String(255), unique=True, nullable=False)

    def __init__(self, category_description):
        self.category_description = category_description
        
    def __repr__(self):
        return f'<Category: {self.category_description}>'


class Citingpaper(Base):
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


class Research(Base):
    __tablename__ = 'research'

    research_id = Column(BigInteger, primary_key=True)
    title = Column(String(255), unique=True, nullable=False)
    presented_where = Column(String(255))
    presentation_location = Column(String(255))
    presentation_date = Column(Date)
    published_where = Column(String(255))
    publication_date = Column(Date)
    doi_or_full = Column(String(255))
    inst_agenda = Column(String(500), nullable=False)
    dept_agenda = Column(String(500), nullable=False)
    user_id = Column(BigInteger, ForeignKey('users.user_id'))

    def __init__(self, title, presented_where, inst_agenda, dept_agenda, user_id, presentation_location=None, presentation_date=None, 
                 published_where=None, publication_date=None, doi_or_full=None):
        self.title = title
        self.presented_where = presented_where
        self.presentation_location = presentation_location
        self.presentation_date = presentation_date
        self.published_where = published_where
        self.publication_date = publication_date
        self.doi_or_full = doi_or_full
        self.inst_agenda = inst_agenda
        self.dept_agenda = dept_agenda
        self.user_id = user_id
        
    def __repr__(self):
        return f'<Research: {self.title}>'


class Fileupload(Base):
    __tablename__ = 'fileupload'

    file_id = Column(BigInteger, primary_key=True)
    research_id = Column(BigInteger, ForeignKey('research.research_id'))
    category_id = Column(BigInteger, ForeignKey('category.category_id'))
    file_type = Column(String(255), nullable=False)
    file_path = Column(String(255), unique=True, nullable=False)

    def __init__(self, research_id, category_id, file_type, file_path):
        self.research_id = research_id
        self.category_id = category_id
        self.file_type = file_type
        self.file_path = file_path
        
    def __repr__(self):
        return f'<File Type: {self.file_type}>'


class Status(Base):
    __tablename__ = 'status'

    status_id = Column(BigInteger, primary_key=True)
    status_desc = Column(String(255))

    def __init__(self, status_desc):
        self.status_desc = status_desc
        
    def __repr__(self):
        return f'<Status: {self.status_desc}>'


class Incentivesapplication(Base):
    __tablename__ = 'incentivesapplication'

    application_id = Column(BigInteger, primary_key=True)
    research_id = Column(BigInteger, ForeignKey('research.research_id'))
    user_id = Column(BigInteger, ForeignKey('users.user_id'))
    status_id = Column(BigInteger, ForeignKey('status.status_id'))
    date_submitted = Column(String(255), nullable=False)
    category_id = Column(BigInteger, ForeignKey('category.category_id'))

    def __init__(self, research_id, user_id, status_id, date_submitted, category_id):
        self.research_id = research_id
        self.user_id = user_id
        self.status_id = status_id
        self.date_submitted = date_submitted
        self.category_id = category_id
        
    def __repr__(self):
        return f'<Incentives Application: {self.date_submitted} (status_id: {self.status_id})>'


class Notification(Base):
    __tablename__ = 'notification'

    notif_id = Column(BigInteger, primary_key=True)
    notif_desc = Column(String(255), nullable=False)
    application_id = Column(BigInteger, ForeignKey('incentivesapplication.application_id', deferrable=True))
    user_id = Column(BigInteger, ForeignKey('users.user_id'))

    def __init__(self, notif_desc, application_id, user_id):
        self.notif_desc = notif_desc
        self.application_id = application_id
        self.user_id = user_id

    def __repr__(self):
        return f'<Notification: {self.notif_desc} (user_id: {self.user_id})>'


class Authorresearch(Base):
    __tablename__ = 'authorresearch'

    research_id = Column(BigInteger, ForeignKey('research.research_id'), primary_key=True)
    author_id = Column(BigInteger, ForeignKey('author.author_id'), primary_key=True)

    def __init__(self, research_id, author_id):
        self.research_id = research_id
        self.author_id = author_id


class Researchciting(Base):
    __tablename__ = 'researchciting'

    research_id = Column(BigInteger, ForeignKey('research.research_id'), primary_key=True)
    citing_id = Column(BigInteger, ForeignKey('citingpaper.citing_id'), primary_key=True)

    def __init__(self, research_id, citing_id):
        self.research_id = research_id
        self.citing_id = citing_id