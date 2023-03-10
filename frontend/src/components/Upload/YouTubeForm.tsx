import * as React from 'react';
import { Col, Form,Button, InputGroup, Spinner } from 'react-bootstrap';
import { Check, X, Youtube } from 'react-bootstrap-icons';
import { YouTubeLinkFetchStatus } from '../../models/YouTubeLinkFetchStatus';
import { YouTubeSearchResponse } from '../../models/YouTubeSearchResponse';
import { YouTubeVideo } from '../../models/YouTubeVideo';
import './YouTubeForm.css';
import { YouTubeSearchResultList } from './YouTubeSearchResultList';

interface Props {
  value?: string;
  searchResponse?: YouTubeSearchResponse;
  disabled: boolean;
  fetchStatus: YouTubeLinkFetchStatus;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchResultClick: (video: YouTubeVideo) => void;
}

export const YouTubeForm = (props: Props): JSX.Element | null => {
  const { value, searchResponse: searchResults, disabled, fetchStatus, handleChange, onSearchResultClick } = props;
  let trailingIcon = null;
  if (fetchStatus === YouTubeLinkFetchStatus.IS_FETCHING) {
    trailingIcon = <Spinner className="ml-2" animation="border" size="sm" role="status" aria-hidden="true" />;
  } else if (fetchStatus === YouTubeLinkFetchStatus.DONE) {
    trailingIcon = <Check className="ml-2" />;
  } else if (fetchStatus === YouTubeLinkFetchStatus.ERROR) {
    trailingIcon = <X className="ml-2" />;
  }

  return (
    <>
      <Form.Row>
        <Form.Group as={Col} controlId="formGridFirst">
          <InputGroup>
            <InputGroup.Text id="basic-addon1"><Youtube /></InputGroup.Text>
            <Form.Control
              name="link"
              style={{padding: '24px !important'}}
              disabled={disabled}
              defaultValue={value}
              placeholder="Paste your youtube link or Type your song title"
              onChange={handleChange}
            />
            <InputGroup.Append style={{    position: 'absolute !important',
    right: '69px !important'}} className="justify-content-center align-items-center">{trailingIcon}</InputGroup.Append>
            <Button variant="secondary" id="button-addon2">
              Fetch
            </Button>
            <p style={{ color: '#ccc',
          fontSize: '12px',
          paddingTop: '10px'
        }}>ex: https://www.youtube.com/watch?v=3452342344829</p>
          </InputGroup>
        </Form.Group>
      </Form.Row>
      <YouTubeSearchResultList searchResponse={searchResults} onSearchResultClick={onSearchResultClick} />
    </>
  );
};
