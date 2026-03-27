from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

"""
Note: 
    Change the following line depending if the project is to be deployed in a docker container or for development.
"""
DATABASE_URI = "postgresql://postgres:1234@host.docker.internal/aru_research_db"

# Using local database connection

# DATABASE_URI = "postgresql://postgres:1234@localhost/aru_research_db"

engine = create_engine(DATABASE_URI, pool_size=100, max_overflow=100, pool_recycle=30)


def get_session(**kwargs):
    """
    This function creates and returns a configured sessionmaker instance.

    Parameters:
    engine (Engine): An optional SQLAlchemy Engine instance. If not provided, a new engine will be created using the default database URL.
    kwargs (dict): Additional keyword arguments to be passed to the sessionmaker constructor.

    Returns:
    sessionmaker: A configured sessionmaker instance bound to the provided or created engine.

    Example:
    >>> from sqlalchemy import create_engine
    >>> from sqlalchemy.orm import sessionmaker
    >>> engine = create_engine('postgresql://postgres:1234@localhost/aru_research_db')
    >>> Session = get_session(engine)
    >>> session = Session()
    """

    return sessionmaker(bind=engine, **kwargs)
