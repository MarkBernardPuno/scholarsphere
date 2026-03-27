import axios from 'axios';
import React, { useState } from 'react';
import { Button, Col, Container, Form, ProgressBar, Row } from 'react-bootstrap';
import { useDataContext } from '../../contexts/data-context';
import { DeleteEvaluationModal } from '../../components/evaluation-page-modals';

const AgendaAlignment1 = ({
  handleReturn,
  handleNext,
  evaluationId,
  isEditMode,
  setIsEditMode,
}) => {
  const { formData, updateFormData } = useDataContext();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  console.log(formData);

  const handleChange = (event) => {
    const { name, id, value, checked, type } = event.target;

    if (id === 'alignedYes') {
      updateFormData({
        ...formData,
        is_agenda_aligned: checked,
      });
    } else if (id === 'alignedNo') {
      updateFormData({
        ...formData,
        is_agenda_aligned: !checked,
      });
    } else if (name === 'is_agenda_aligned_remarks') {
      updateFormData({
        ...formData,
        is_agenda_aligned_remarks: value,
      });
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(true);
  };

  const handleEditClick = () => setIsEditMode(true);

  const handleCancelEdit = () => setIsEditMode(false);

  const instAgendaText = formData.instagendas
    ? formData.instagendas.map((instagenda) => instagenda.label).join(', ')
    : '';

  return (
    <Container fluid>
      <Row
        className="d-flex align-items-center"
        style={{ paddingLeft: '1rem', gap: '20px', paddingRight: '1rem' }}
      >
        <Col>
          <h2 className="titleFont m-0 p-0">Research Evaluation Checklist</h2>
        </Col>
        <Col className="d-flex justify-content-end">
          {!isEditMode ? (
            <Button variant="warning" onClick={handleEditClick} style={{ marginLeft: '0.5rem' }}>
              Edit
            </Button>
          ) : (
            <Button
              variant="outline-warning"
              onClick={handleCancelEdit}
              style={{ marginLeft: '0.5rem' }}
            >
              Cancel Edit
            </Button>
          )}
          <Button variant="warning" onClick={handleDelete} style={{ marginLeft: '0.5rem' }}>
            Delete
          </Button>
        </Col>
      </Row>

      <h3 style={{ fontSize: '0.8rem', paddingLeft: '3rem', paddingRight: '3rem' }}>Step 2 of 5</h3>
      <ProgressBar variant="warning" now={40} className="mb-3" />

      <Form>
        <Row>
          <Col style={{ marginLeft: '40px', marginTop: '0px' }}>
            <h2 className="titleFont p-2">I. Research Agenda Alignment</h2>
          </Col>
        </Row>
        <Row className="mb-1" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
          <Form.Group as={Col} xs lg="6">
            <Form.Label className="labelFont">Institutional Research Agenda</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="instagendas"
              value={instAgendaText}
              onChange={handleChange}
              readOnly
            />
          </Form.Group>

          <Form.Group as={Col} xs={12} lg={6}>
            <Form.Label className="labelFont" style={{ marginLeft: '0px' }}>
              Is the research paper aligned to the department research agenda?
            </Form.Label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '60%',
                backgroundColor: '#E9ECEF',
                borderRadius: '10px',
              }}
            >
              <Form.Check
                inline
                label="Yes"
                type="checkbox"
                id="alignedYes"
                name="is_agenda_aligned"
                onChange={handleChange}
                checked={formData.is_agenda_aligned === true}
                disabled={!isEditMode}
              />

              <Form.Check
                inline
                label="No"
                type="checkbox"
                id="alignedNo"
                name="is_agenda_aligned"
                onChange={handleChange}
                checked={formData.is_agenda_aligned === false}
                disabled={!isEditMode}
              />
            </div>
          </Form.Group>
        </Row>
      </Form>
      <Form>
        <Row className="mb-3" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
          <Form.Group as={Col} xs lg="12">
            <Form.Label className="labelFont">Remarks (if any)</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="is_agenda_aligned_remarks"
              value={formData.is_agenda_aligned_remarks}
              onChange={handleChange}
              readOnly={!isEditMode}
            />
          </Form.Group>
        </Row>
      </Form>
      <Row style={{ paddingLeft: '20rem', paddingRight: '20rem' }}>
        <>
          <Button variant="outline-warning" as={Col} onClick={handleReturn}>
            Return
          </Button>{' '}
          <Col md="auto"></Col>
          <Button variant="warning" as={Col} onClick={() => handleNext(formData)}>
            Continue
          </Button>{' '}
        </>
      </Row>

      <DeleteEvaluationModal
        show={showDeleteModal}
        evaluationId={evaluationId}
        onClose={() => setShowDeleteModal(false)}
        trigger={handleReturn} // Use handleReturn to refresh or redirect after deletion
        setShow={setShowDeleteModal}
      />
    </Container>
  );
};

export default AgendaAlignment1;
