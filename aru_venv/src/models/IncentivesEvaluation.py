from sqlalchemy import Column, String, BigInteger, ForeignKey, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from models.Base import Base

class IncentivesEvaluation(Base):
    __tablename__ = 'incentivesevaluation'

    evaluation_id = Column(BigInteger, primary_key=True, autoincrement=True)
    research_id = Column(BigInteger, ForeignKey('research.research_id'))
    date_evaluated = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())
    evaluated_by = Column(BigInteger, ForeignKey('users.user_id'))
    
    #I. Research Agenda Alignment
    is_agenda_aligned = Column(Boolean, nullable=False)
    is_agenda_aligned_remarks = Column(String(255))
    
    #II. Research Components, Criteria, and Evaluation
    is_title = Column(Boolean, nullable=False)
    is_title_remarks = Column(String(255))
    
    is_problem1 = Column(Boolean, nullable=False)
    is_problem1_remarks = Column(String(255))
    
    is_problem2 = Column(Boolean, nullable=False)
    is_problem2_remarks = Column(String(255))
    
    is_significance1 = Column(Boolean, nullable=False)
    is_significance1_remarks = Column(String(255))
    
    is_significance2 = Column(Boolean, nullable=False)
    is_significance2_remarks = Column(String(255))
    
    is_significance3 = Column(Boolean, nullable=False)
    is_significance3_remarks = Column(String(255))
    
    is_significance4 = Column(Boolean, nullable=False)
    is_significance4_remarks = Column(String(255))
    
    #III. Initial Research Ethics Review and Evaluation
    is_ethics_criteria1 = Column(Boolean, nullable=False)
    is_ethics_criteria1_remarks = Column(String(255))
    
    is_ethics_criteria2a = Column(Boolean, nullable=False)
    is_ethics_criteria2a_remarks = Column(String(255))
    
    is_ethics_criteria2b = Column(Boolean, nullable=False)
    is_ethics_criteria2b_remarks = Column(String(255))
    
    is_ethics_criteria3a = Column(Boolean, nullable=False)
    is_ethics_criteria3a_remarks = Column(String(255))
    
    is_ethics_criteria3b = Column(Boolean, nullable=False)
    is_ethics_criteria3b_remarks = Column(String(255))
    
    is_ethics_criteria4 = Column(Boolean, nullable=False)
    is_ethics_criteria4_remarks = Column(String(255))
    
    is_ethics_criteria4 = Column(Boolean, nullable=False)
    is_ethics_criteria4_remarks = Column(String(255))
    
    is_ethics_criteria5 = Column(Boolean, nullable=False)
    is_ethics_criteria5_remarks = Column(String(255))
    
    #V. Evaluation Result
    status_id = Column(BigInteger, ForeignKey("status.status_id"))
    status_remarks = Column(String(255))
    
    user = relationship("Users", back_populates="incentivesevaluation")
    status = relationship("Status", back_populates="incentivesevaluation")
    research = relationship("Research", back_populates="incentivesevaluation")

    def __init__(self, research_id, evaluated_by,
                 is_agenda_aligned, is_agenda_aligned_remarks, is_title, is_title_remarks,
                 is_problem1, is_problem1_remarks, is_problem2, is_problem2_remarks, is_significance1, is_significance1_remarks,
                 is_significance2, is_significance2_remarks, is_significance3, is_significance3_remarks, is_significance4, is_significance4_remarks,
                 is_ethics_criteria1, is_ethics_criteria1_remarks, is_ethics_criteria2a, is_ethics_criteria2a_remarks,
                 is_ethics_criteria2b, is_ethics_criteria2b_remarks, is_ethics_criteria3a, is_ethics_criteria3a_remarks,
                 is_ethics_criteria3b, is_ethics_criteria3b_remarks, is_ethics_criteria4, is_ethics_criteria4_remarks,
                 is_ethics_criteria5, is_ethics_criteria5_remarks, status_id, status_remarks):

        self.research_id = research_id
        self.evaluated_by = evaluated_by
        
        self.is_agenda_aligned = is_agenda_aligned
        self.is_agenda_aligned_remarks = is_agenda_aligned_remarks
        
        self.is_title = is_title
        self.is_title_remarks = is_title_remarks
        
        self.is_problem1 = is_problem1
        self.is_problem1_remarks = is_problem1_remarks
        
        self.is_problem2 = is_problem2
        self.is_problem2_remarks = is_problem2_remarks
        
        self.is_significance1 = is_significance1
        self.is_significance1_remarks = is_significance1_remarks
        
        self.is_significance2 = is_significance2
        self.is_significance2_remarks = is_significance2_remarks
        
        self.is_significance3 = is_significance3
        self.is_significance3_remarks = is_significance3_remarks
        
        self.is_significance4 = is_significance4
        self.is_significance4_remarks = is_significance4_remarks
        
        self.is_ethics_criteria1 = is_ethics_criteria1
        self.is_ethics_criteria1_remarks = is_ethics_criteria1_remarks
        
        self.is_ethics_criteria2a = is_ethics_criteria2a
        self.is_ethics_criteria2a_remarks = is_ethics_criteria2a_remarks
        
        self.is_ethics_criteria2b = is_ethics_criteria2b
        self.is_ethics_criteria2b_remarks = is_ethics_criteria2b_remarks
        
        self.is_ethics_criteria3a = is_ethics_criteria3a
        self.is_ethics_criteria3a_remarks = is_ethics_criteria3a_remarks
        
        self.is_ethics_criteria3b = is_ethics_criteria3b
        self.is_ethics_criteria3b_remarks = is_ethics_criteria3b_remarks
        
        self.is_ethics_criteria4 = is_ethics_criteria4
        self.is_ethics_criteria4_remarks = is_ethics_criteria4_remarks
        
        self.is_ethics_criteria5 = is_ethics_criteria5
        self.is_ethics_criteria5_remarks = is_ethics_criteria5_remarks
        
        self.status_id = status_id
        self.status_remarks = status_remarks
        
    def __repr__(self):
        return f'<Incentives Evaluation>'
    
    def as_dict(self):
        return {
            "research_id":self.research_id,
            "date_evaluated":self.date_evaluated,
            "evaluated_by":self.evaluated_by,
            
            "is_agenda_aligned":self.is_agenda_aligned,
            "is_agenda_aligned_remarks":self.is_agenda_aligned_remarks,
            
            "is_title":self.is_title,
            "is_title_remarks":self.is_title_remarks,
            
            "is_problem1":self.is_problem1,
            "is_problem1_remarks":self.is_problem1_remarks,
            
            "is_problem2":self.is_problem2,
            "is_problem2_remarks":self.is_problem2_remarks,
            
            "is_significance1":self.is_significance1,
            "is_significance1_remarks":self.is_significance1_remarks,
            
            "is_significance2":self.is_significance2,
            "is_significance2_remarks":self.is_significance2_remarks,
            
            "is_significance3":self.is_significance3,
            "is_significance3_remarks":self.is_significance3_remarks,
            
            "is_significance4":self.is_significance4,
            "is_significance4_remarks":self.is_significance4_remarks,
            
            "is_ethics_criteria1":self.is_ethics_criteria1,
            "is_ethics_criteria1_remarks":self.is_ethics_criteria1_remarks,
            
            "is_ethics_criteria2a":self.is_ethics_criteria2a,
            "is_ethics_criteria2a_remarks":self.is_ethics_criteria2a_remarks,
            
            "is_ethics_criteria2b":self.is_ethics_criteria2b,
            "is_ethics_criteria2b_remarks":self.is_ethics_criteria2b_remarks,
            
            "is_ethics_criteria3a":self.is_ethics_criteria3a,
            "is_ethics_criteria3a_remarks":self.is_ethics_criteria3a_remarks,
            
            "is_ethics_criteria3b":self.is_ethics_criteria3b,
            "is_ethics_criteria3b_remarks":self.is_ethics_criteria3b_remarks,
            
            "is_ethics_criteria4":self.is_ethics_criteria4,
            "is_ethics_criteria4_remarks":self.is_ethics_criteria4_remarks,
            
            "is_ethics_criteria5":self.is_ethics_criteria5,
            "is_ethics_criteria5_remarks":self.is_ethics_criteria5_remarks,
            
            "status_id":self.status_id,
            "status_remarks":self.status_remarks
        }
       