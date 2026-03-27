import React from 'react';
import { Form, Col } from 'react-bootstrap';

/**
 * Reusable file input component for forms.
 * Props:
 * - label: string (label for the input)
 * - name: string (input name)
 * - value: file object or string (file name/path)
 * - onChange: function (input change handler)
 * - disabled: boolean (optional)
 * - id: string (optional, for htmlFor)
 * - dataFileType: string (optional, for data-file-type)
 * - accept: string (optional, file types)
 */
const FileInput = ({
  label,
  name,
  value,
  onChange,
  disabled = false,
  id,
  dataFileType,
  accept,
}) => (
  <Form.Group as={Col} xs lg="6">
    <Form.Label className="labelFont">{label}</Form.Label>
    <div className="custom-file-input-wrapper">
      <input
        type="file"
        id={id || name}
        name={name}
        className="custom-file-input"
        data-file-type={dataFileType}
        onChange={onChange}
        disabled={disabled}
        accept={accept}
      />
      <label htmlFor={id || name} className="custom-file-label">
        {value?.name || value || 'Choose file'}
      </label>
    </div>
  </Form.Group>
);

export default FileInput;
