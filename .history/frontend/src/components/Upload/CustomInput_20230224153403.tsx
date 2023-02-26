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
  const buttonClass = disabled ? 'btn btn-success disabled' : 'btn btn-success';
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
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-file-earmark-arrow-up" viewBox="0 0 16 16">
  <path d="M8.5 11.5a.5.5 0 0 1-1 0V7.707L6.354 8.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 7.707V11.5z"/>
  <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
</svg>
      <p className="d-flex align-items-center justify-content-start" style={{opacity: 0.3}}>
        Drag and drop an audio file or Browse via upload button {'  '}
        <OverlayTrigger placement="right" delay={{ show: 50, hide: 50 }} overlay={supportedFormatsTooltip}>
          <InfoCircle className="ml-1" size={14} style={{ cursor: 'pointer' }} />
        </OverlayTrigger>
      </p>

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
