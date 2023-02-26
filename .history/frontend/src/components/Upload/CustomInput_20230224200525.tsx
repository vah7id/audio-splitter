/* eslint-disable @typescript-eslint/no-explicit-any */
import { IInputProps } from '@jeffreyca/react-dropzone-uploader';
import { getDroppedOrSelectedFiles } from 'html5-file-selector';
import * as React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { CloudUpload, InfoCircle } from 'react-bootstrap-icons';
import { OverlayInjectedProps } from 'react-bootstrap/esm/Overlay';
import { ALLOWED_EXTENSIONS } from '../../Constants';

/**
 * Custom file input component for the dropzone uploader.
 */
const CustomInput = ({ accept, onFiles, files, disabled }: IInputProps): JSX.Element | null => {
  const text = 'Upload My Audio File';
  const buttonClass = disabled ? 'btn btn-warning disabled' : 'btn btn-warning';
  /**
   * Get dropped files.
   */
  const getFilesFromEvent = (e: any) => {
    return new Promise(resolve => {
      getDroppedOrSelectedFiles(e).then((chosenFiles: any) => {
        resolve(chosenFiles.map((f: any) => f.fileObject));
      });
    });
  };

  const supportedFormatsTooltip = (props: OverlayInjectedProps) => {
    const text = 'Supported: ' + ALLOWED_EXTENSIONS.sort().join(', ');

    return (
      <Tooltip id="status-tooltip" {...props}>
        {text}
      </Tooltip>
    );
  };

  return files.length > 0 ? null : (
    <div className="text-center p-3">
     <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#999" class="bi bi-upload" viewBox="0 0 16 16">
      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
      <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
    </svg>
      <p className="d-flex align-items-center justify-content-start" style={{opacity: 0.5, marginTop: '18px'}}>
        Drag and drop an audio file or Browse via upload button {'  '}
        <OverlayTrigger placement="right" delay={{ show: 50, hide: 50 }} overlay={supportedFormatsTooltip}>
          <InfoCircle className="ml-1" size={14} style={{ cursor: 'pointer' }} />
        </OverlayTrigger>
      </p>
      <p style={{opacity: 0.3, marginTop: '18px'}}>Supported Formats: {ALLOWED_EXTENSIONS.sort().join(', ')}</p>
      <label className={buttonClass}>
        {text}
        <input
          style={{ display: 'none' }}
          type="file"
          accept={accept}
          onChange={e => {
            getFilesFromEvent(e).then((chosenFiles: any) => {
              onFiles(chosenFiles);
            });
          }}
        />
      </label>
    </div>
  );
};

export default CustomInput;
