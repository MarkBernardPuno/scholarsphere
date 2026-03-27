from sqlalchemy import Column, String, BigInteger, ForeignKey
from models.Base import Base

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